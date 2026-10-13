use std::{collections::HashMap, fs, path::Path, time::Duration};

use butterflow_core::{config::WorkflowRunConfig, engine::Engine};
use butterflow_models::{TaskStatus, Workflow, WorkflowStatus};
use butterflow_state::{local_adapter::LocalStateAdapter, StateAdapter};
use serde_json::{json, Value};
use tempfile::TempDir;

fn test_dir() -> TempDir {
    // Relative local package sources work on both Unix and Windows.
    TempDir::new_in(std::env::current_dir().unwrap()).unwrap()
}

fn workflow(steps: &str) -> Workflow {
    serde_yaml::from_str(&format!(
        "version: '1'\nnodes:\n  - id: apply\n    name: Apply\n    steps:\n{steps}"
    ))
    .unwrap()
}

fn write_package(path: &Path, workflow: &Workflow) {
    fs::create_dir_all(path).unwrap();
    fs::write(path.join("codemod.yaml"), "name: state-test\n").unwrap();
    fs::write(
        path.join("workflow.yaml"),
        serde_yaml::to_string(workflow).unwrap(),
    )
    .unwrap();
}

fn child_step(path: &Path) -> String {
    let source = format!(
        "./{}",
        path.strip_prefix(std::env::current_dir().unwrap())
            .unwrap()
            .to_string_lossy()
            .replace('\\', "/")
    );
    format!(
        "      - name: Run child\n        codemod:\n          source: {}\n",
        serde_json::to_string(&source).unwrap()
    )
}

fn state_command(assignment: &str) -> String {
    let output = if cfg!(windows) {
        "\"%STATE_OUTPUTS%\""
    } else {
        "\"$STATE_OUTPUTS\""
    };
    format!("echo {assignment} >> {output}")
}

fn shell_step(name: &str, assignment: &str) -> String {
    format!(
        "      - name: {name}\n        run: {}\n",
        serde_json::to_string(&state_command(assignment)).unwrap()
    )
}

async fn run_workflow(root: &Path, bundle: &Path, workflow: Workflow) -> HashMap<String, Value> {
    let target = root.join("target");
    fs::create_dir_all(&target).unwrap();
    fs::write(target.join("package.json"), "{\"private\":true}\n").unwrap();

    let state_dir = root.join("state");
    let mut config = WorkflowRunConfig::default();
    config.execution.bundle_path = bundle.to_path_buf();
    config.execution.target_path = target;
    config.interaction.no_interactive = true;
    config.output.quiet = true;
    config.output.capture_stdout_in_quiet_mode = false;
    config.managed_git.enable_managed_git = false;
    let engine = Engine::with_state_adapter(
        Box::new(LocalStateAdapter::with_base_dir(&state_dir)),
        config,
    );
    let run_id = engine
        .run_workflow(workflow, HashMap::new(), Some(bundle.to_path_buf()), None)
        .await
        .unwrap();

    let run = tokio::time::timeout(Duration::from_secs(20), async {
        loop {
            let run = engine.get_workflow_run(run_id).await.unwrap();
            if matches!(
                run.status,
                WorkflowStatus::Completed | WorkflowStatus::Failed
            ) {
                break run;
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    })
    .await
    .expect("workflow should finish");

    let tasks = engine.get_tasks(run_id).await.unwrap();
    assert_eq!(run.status, WorkflowStatus::Completed, "tasks: {tasks:?}");
    assert!(tasks
        .iter()
        .all(|task| task.status == TaskStatus::Completed));
    LocalStateAdapter::with_base_dir(state_dir)
        .get_state(run_id)
        .await
        .unwrap()
}

#[tokio::test]
async fn nested_workflow_state_jssg_writes_are_visible_to_shell() {
    // The same child must behave identically standalone and inside `codemod:`.
    for nested in [false, true] {
        let root = test_dir();
        let bundle = root.path().join("child");
        let child = workflow(&format!(
            "      - name: Initialize target\n        js-ast-grep:\n          js_file: init.js\n          language: json\n          include: ['**/package.json']\n{}",
            shell_step("Read target", "observed=${{ state.targetDirEncoded }}")
        ));
        write_package(&bundle, &child);
        fs::write(
            bundle.join("init.js"),
            "import { setState } from 'codemod:workflow';\nexport default function transform() { setState('targetDirEncoded', 'initialized'); return null; }\n",
        )
        .unwrap();
        let run = if nested {
            workflow(&child_step(&bundle))
        } else {
            child
        };
        let state = run_workflow(root.path(), &bundle, run).await;
        assert_eq!(state.get("observed"), Some(&json!("initialized")));
    }
}

#[tokio::test]
async fn nested_workflow_state_conditions_observe_shell_updates() {
    let root = test_dir();
    let bundle = root.path().join("child");
    let child = workflow(&format!(
        "{}{}        if: state.ready == true\n",
        shell_step("Set ready", "ready=true"),
        shell_step("Conditional read", "observed=ran"),
    ));
    write_package(&bundle, &child);
    let parent = workflow(&format!(
        "{}{}",
        shell_step("Seed false", "ready=false"),
        child_step(&bundle)
    ));
    let state = run_workflow(root.path(), &bundle, parent).await;
    assert_eq!(state.get("ready"), Some(&json!(true)));
    assert_eq!(state.get("observed"), Some(&json!("ran")));
}

#[tokio::test]
async fn nested_workflow_state_jssg_reads_observe_updates_and_removals() {
    let root = test_dir();
    let bundle = root.path().join("child");
    let child = workflow(
        "      - name: Update state\n        js-ast-grep:\n          js_file: update.js\n          language: json\n          include: ['**/package.json']\n      - name: Read state\n        js-ast-grep:\n          js_file: read.js\n          language: json\n          include: ['**/package.json']\n",
    );
    write_package(&bundle, &child);
    fs::write(
        bundle.join("update.js"),
        "import { setState, unsetState } from 'codemod:workflow';\nexport default function transform() { setState('value', 'new'); unsetState('removed'); return null; }\n",
    )
    .unwrap();
    fs::write(
        bundle.join("read.js"),
        "import { getState, setState } from 'codemod:workflow';\nexport default function transform() { setState('observed', getState('value')); setState('wasRemoved', getState('removed') === undefined); return null; }\n",
    )
    .unwrap();
    let parent = workflow(&format!(
        "{}{}{}",
        shell_step("Seed value", "value=old"),
        shell_step("Seed removal", "removed=old"),
        child_step(&bundle)
    ));
    let state = run_workflow(root.path(), &bundle, parent).await;
    assert_eq!(state.get("observed"), Some(&json!("new")));
    assert_eq!(state.get("value"), Some(&json!("new")));
    assert_eq!(state.get("wasRemoved"), Some(&json!(true)));
    assert!(!state.contains_key("removed"));
}

#[tokio::test]
async fn nested_workflow_state_is_refreshed_across_nodes_and_grandchildren() {
    let root = test_dir();
    let child_dir = root.path().join("child");
    let grandchild_dir = root.path().join("grandchild");
    let grandchild = workflow(&format!(
        "{}{}",
        shell_step("Read child value", "grandchildRead=${{ state.value }}"),
        shell_step("Update value", "value=grandchild")
    ));
    write_package(&grandchild_dir, &grandchild);
    let mut child = workflow(&shell_step("Initialize value", "value=child"));
    let mut next_node = workflow(&format!(
        "{}{}",
        child_step(&grandchild_dir),
        shell_step("Read grandchild value", "observed=${{ state.value }}")
    ))
    .nodes
    .remove(0);
    next_node.id = "read".to_string();
    next_node.depends_on = vec!["apply".to_string()];
    child.nodes.push(next_node);
    write_package(&child_dir, &child);
    let parent = workflow(&child_step(&child_dir));
    let state = run_workflow(root.path(), &child_dir, parent).await;
    assert_eq!(state.get("grandchildRead"), Some(&json!("child")));
    assert_eq!(state.get("observed"), Some(&json!("grandchild")));
}
