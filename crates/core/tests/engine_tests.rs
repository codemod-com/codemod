use butterflow_state::mock_adapter::MockStateAdapter;
use std::collections::HashMap;
use std::fs;
use tempfile::TempDir;

use butterflow_core::engine::Engine;
use butterflow_core::{
    Node, Runtime, RuntimeType, Step, Task, TaskStatus, Template, Workflow, WorkflowRun,
    WorkflowStatus,
};
use butterflow_models::node::NodeType;
use butterflow_models::step::{StepAction, UseAstGrep, UseJSAstGrep};
use butterflow_models::strategy::Strategy;
use butterflow_models::trigger::TriggerType;
use butterflow_models::{DiffOperation, FieldDiff, TaskDiff};
use butterflow_state::local_adapter::LocalStateAdapter;
use butterflow_state::StateAdapter;
use uuid::Uuid;

// Helper function to create a simple test workflow
fn create_test_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with a manual trigger
fn create_manual_trigger_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                trigger: Some(butterflow_models::trigger::Trigger {
                    r#type: TriggerType::Manual,
                }),
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with a manual node type
fn create_manual_node_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Manual,
                depends_on: vec!["node1".to_string()],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with a matrix strategy
fn create_matrix_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                trigger: None,
                strategy: Some(Strategy {
                    r#type: butterflow_models::strategy::StrategyType::Matrix,
                    values: Some(vec![
                        HashMap::from([(
                            "region".to_string(),
                            serde_json::to_value("us-east").unwrap(),
                        )]),
                        HashMap::from([(
                            "region".to_string(),
                            serde_json::to_value("us-west").unwrap(),
                        )]),
                        HashMap::from([(
                            "region".to_string(),
                            serde_json::to_value("eu-central").unwrap(),
                        )]),
                    ]),
                    from_state: None,
                }),
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Processing region ${region}'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

// Helper function to create a workflow with templates
fn create_template_workflow() -> Workflow {
    let template = Template {
        id: "checkout-repo".to_string(),
        name: "Checkout Repository".to_string(),
        description: Some("Standard process for checking out a repository".to_string()),
        inputs: vec![
            butterflow_models::TemplateInput {
                name: "repo_url".to_string(),
                r#type: "string".to_string(),
                required: true,
                description: Some("URL of the repository to checkout".to_string()),
                default: None,
            },
            butterflow_models::TemplateInput {
                name: "branch".to_string(),
                r#type: "string".to_string(),
                required: false,
                description: Some("Branch to checkout".to_string()),
                default: Some("main".to_string()),
            },
        ],
        runtime: Some(Runtime {
            r#type: RuntimeType::Direct,
            image: None,
            working_dir: None,
            user: None,
            network: None,
            options: None,
        }),
        steps: vec![Step {
            name: "Clone repository".to_string(),
            action: StepAction::RunScript(
                "echo 'Cloning repository ${inputs.repo_url} branch ${inputs.branch}'".to_string(),
            ),
            env: None,
        }],
        outputs: vec![],
        env: HashMap::new(),
    };

    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![template],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1".to_string(),
            description: Some("Test node 1".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                name: "Step 1".to_string(),
                action: StepAction::UseTemplate(butterflow_models::step::TemplateUse {
                    template: "checkout-repo".to_string(),
                    inputs: HashMap::from([
                        (
                            "repo_url".to_string(),
                            "https://github.com/example/repo".to_string(),
                        ),
                        ("branch".to_string(), "feature/test".to_string()),
                    ]),
                }),
                env: None,
            }],
            env: HashMap::new(),
        }],
    }
}

// Helper function to create a workflow with matrix strategy from state
fn create_matrix_from_state_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: Some(butterflow_models::WorkflowState {
            schema: vec![butterflow_models::StateSchema {
                name: "files".to_string(),
                r#type: butterflow_models::StateSchemaType::Array,
                items: Some(Box::new(butterflow_models::StateSchemaItems {
                    r#type: butterflow_models::StateSchemaType::Object,
                    properties: Some(HashMap::from([(
                        "file".to_string(),
                        butterflow_models::StateSchemaProperty {
                            r#type: butterflow_models::StateSchemaType::String,
                            description: None,
                        },
                    )])),
                })),
                description: None,
            }],
        }),
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Setting up state'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()],
                trigger: None,
                strategy: Some(Strategy {
                    r#type: butterflow_models::strategy::StrategyType::Matrix,
                    values: None,
                    from_state: Some("files".to_string()),
                }),
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Processing file ${file}'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    }
}

#[tokio::test]
async fn test_engine_new() {
    let _ = Engine::new();
}

#[tokio::test]
async fn test_engine_with_state_adapter() {
    let state_adapter = Box::new(LocalStateAdapter::new());
    let _ = Engine::with_state_adapter(state_adapter);
}

#[tokio::test]
async fn test_run_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();
    assert_eq!(workflow_run.id, workflow_run_id);

    // The workflow should be running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );
}

#[tokio::test]
async fn test_get_workflow_status() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();

    // The workflow should be running or completed
    assert!(status == WorkflowStatus::Running || status == WorkflowStatus::Completed);
}

#[tokio::test]
async fn test_get_tasks() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow.clone(), params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be tasks for each node
    assert_eq!(tasks.len(), workflow.nodes.len());

    // Check that the tasks have the correct node IDs
    let node_ids: Vec<String> = tasks.iter().map(|t| t.node_id.clone()).collect();
    assert!(node_ids.contains(&"node1".to_string()));
    assert!(node_ids.contains(&"node2".to_string()));
}

#[tokio::test]
async fn test_list_workflow_runs() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Run multiple workflows
    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id1 = engine
        .run_workflow(workflow.clone(), params.clone(), None, None, None)
        .await
        .unwrap();
    let workflow_run_id2 = engine
        .run_workflow(workflow.clone(), params.clone(), None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflows to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    let runs = engine.list_workflow_runs(10).await.unwrap();

    // There should be at least 2 workflow runs
    assert!(runs.len() >= 2);

    // The runs should include our workflow run IDs
    let run_ids: Vec<Uuid> = runs.iter().map(|r| r.id).collect();
    assert!(run_ids.contains(&workflow_run_id1));
    assert!(run_ids.contains(&workflow_run_id2));
}

#[tokio::test]
async fn test_cancel_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Cancel the workflow
    engine.cancel_workflow(workflow_run_id).await.unwrap();

    // Check the workflow status
    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();
    assert_eq!(status, WorkflowStatus::Canceled);
}

#[tokio::test]
async fn test_manual_trigger_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_manual_trigger_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the task for node2 which should be awaiting trigger
    let node2_task = tasks.iter().find(|t| t.node_id == "node2").unwrap();

    // Check that the task is awaiting trigger
    assert_eq!(node2_task.status, TaskStatus::AwaitingTrigger);

    // Trigger the task using resume_workflow
    engine
        .resume_workflow(workflow_run_id, vec![node2_task.id], None, None)
        .await
        .unwrap();

    // Allow some time for the task to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the updated tasks
    let updated_tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the updated task for node2
    let updated_node2_task = updated_tasks
        .iter()
        .find(|t| t.id == node2_task.id)
        .unwrap();

    // Check that the task is now running or completed
    assert!(
        updated_node2_task.status == TaskStatus::Running
            || updated_node2_task.status == TaskStatus::Completed
    );
}

#[tokio::test]
async fn test_manual_node_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_manual_node_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the task for node2 which should be awaiting trigger
    let node2_task = tasks.iter().find(|t| t.node_id == "node2").unwrap();

    // Check that the task is awaiting trigger
    assert_eq!(node2_task.status, TaskStatus::AwaitingTrigger);

    // Trigger the task using resume_workflow
    engine
        .resume_workflow(workflow_run_id, vec![node2_task.id], None, None)
        .await
        .unwrap();

    // Allow some time for the task to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the updated tasks
    let updated_tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the updated task for node2
    let updated_node2_task = updated_tasks
        .iter()
        .find(|t| t.id == node2_task.id)
        .unwrap();

    // Check that the task is now running or completed
    assert!(
        updated_node2_task.status == TaskStatus::Running
            || updated_node2_task.status == TaskStatus::Completed
    );
}

#[tokio::test]
async fn test_matrix_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_matrix_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 4 tasks:
    // 1 for node1, 1 master task for node2, and 3 matrix tasks for node2
    assert!(tasks.len() >= 4);

    // Count the number of tasks for node2
    let node2_tasks = tasks.iter().filter(|t| t.node_id == "node2").count();

    // There should be at least 3 matrix tasks for node2 (one for each region)
    assert!(node2_tasks >= 3);
}

#[tokio::test]
async fn test_template_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_template_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for node1 exists
    let node1_task = tasks.iter().find(|t| t.node_id == "node1").unwrap();

    // Print the task status for debugging
    println!("Node1 task status: {:?}", node1_task.status);
}

// Test for trigger_all method
#[tokio::test]
async fn test_trigger_all() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_manual_trigger_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow status
    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();

    // The workflow should be awaiting trigger or running
    assert!(status == WorkflowStatus::AwaitingTrigger || status == WorkflowStatus::Running);

    // Trigger all awaiting tasks
    engine
        .trigger_all(workflow_run_id, None, None)
        .await
        .unwrap();

    // Allow some time for the tasks to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow status again
    let status = engine.get_workflow_status(workflow_run_id).await.unwrap();

    // The workflow should now be running or completed
    assert!(status == WorkflowStatus::Running || status == WorkflowStatus::Completed);
}

// Helper function to create a workflow with environment variables
fn create_env_var_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1".to_string(),
            description: Some("Test node 1".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                name: "Step 1".to_string(),
                action: StepAction::RunScript("echo 'Using env var: $TEST_ENV_VAR'".to_string()),
                env: Some(HashMap::from([(
                    "STEP_SPECIFIC_VAR".to_string(),
                    "step-value".to_string(),
                )])),
            }],
            env: HashMap::from([
                ("TEST_ENV_VAR".to_string(), "test-value".to_string()),
                ("NODE_SPECIFIC_VAR".to_string(), "node-value".to_string()),
            ]),
        }],
    }
}

// Helper function to create a workflow with variable resolution
fn create_variable_resolution_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1 for ${params.repo_name}".to_string(),
            description: Some("Processing ${params.branch}".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                name: "Step 1".to_string(),
                action: StepAction::RunScript(
                    "echo 'Processing repo: ${params.repo_name} on branch: ${params.branch}'"
                        .to_string(),
                ),
                env: None,
            }],
            env: HashMap::from([
                ("REPO_URL".to_string(), "${params.repo_url}".to_string()),
                ("DEBUG".to_string(), "${env.CI}".to_string()),
            ]),
        }],
    }
}

// Helper function to create a workflow that tests environment variables
fn create_env_vars_test_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "env-test-node".to_string(),
            name: "Environment Variables Test Node".to_string(),
            description: Some("Test node for environment variables".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                name: "Test Environment Variables".to_string(),
                action: StepAction::RunScript(
                    r#"echo "CODEMOD_TASK_ID=$CODEMOD_TASK_ID"
echo "CODEMOD_WORKFLOW_RUN_ID=$CODEMOD_WORKFLOW_RUN_ID"
echo "task_id_set=$(if [ -n "$CODEMOD_TASK_ID" ]; then echo "true"; else echo "false"; fi)"
echo "workflow_run_id_set=$(if [ -n "$CODEMOD_WORKFLOW_RUN_ID" ]; then echo "true"; else echo "false"; fi)"
echo "task_id_valid=$(if [ "$CODEMOD_TASK_ID" != "" ] && [ ${#CODEMOD_TASK_ID} -eq 36 ]; then echo "true"; else echo "false"; fi)"
echo "workflow_run_id_valid=$(if [ "$CODEMOD_WORKFLOW_RUN_ID" != "" ] && [ ${#CODEMOD_WORKFLOW_RUN_ID} -eq 36 ]; then echo "true"; else echo "false"; fi)""#.to_string(),
                ),
                env: None,
            }],
            env: HashMap::new(),
        }],
    }
}

#[tokio::test]
async fn test_matrix_recompilation_with_direct_adapter() {
    // Create a mock state adapter
    let mut state_adapter = MockStateAdapter::new();

    // Create a workflow with a matrix node using from_state
    let workflow = create_matrix_from_state_workflow();

    // Create a workflow run
    let workflow_run_id = Uuid::new_v4();
    let workflow_run = WorkflowRun {
        id: workflow_run_id,
        workflow: workflow.clone(),
        status: WorkflowStatus::Running,
        params: HashMap::new(),
        tasks: Vec::new(),
        started_at: chrono::Utc::now(),
        ended_at: None,
        bundle_path: None,
    };

    // Save the workflow run
    state_adapter
        .save_workflow_run(&workflow_run)
        .await
        .unwrap();

    // Create a task for node1
    let node1_task = Task {
        id: Uuid::new_v4(),
        workflow_run_id,
        node_id: "node1".to_string(),
        status: TaskStatus::Completed,
        is_master: false,
        master_task_id: None,
        matrix_values: None,
        started_at: Some(chrono::Utc::now()),
        ended_at: Some(chrono::Utc::now()),
        error: None,
        logs: Vec::new(),
    };

    // Save the task
    state_adapter.save_task(&node1_task).await.unwrap();

    // Create a master task for node2
    let master_task = Task {
        id: Uuid::new_v4(),
        workflow_run_id,
        node_id: "node2".to_string(),
        status: TaskStatus::Pending,
        is_master: true,
        master_task_id: None,
        matrix_values: None,
        started_at: None,
        ended_at: None,
        error: None,
        logs: Vec::new(),
    };

    // Save the master task
    state_adapter.save_task(&master_task).await.unwrap();

    // Set state with initial files
    let files_array = serde_json::json!([
        {"file": "file1.txt"},
        {"file": "file2.txt"}
    ]);

    let mut state = HashMap::new();
    state.insert("files".to_string(), files_array);

    // Update the state directly on our adapter
    state_adapter
        .update_state(workflow_run_id, state)
        .await
        .unwrap();

    // Verify that two matrix tasks are created when we feed this state with matrix file values

    // First verify we have the initial tasks (master task for node2)
    let initial_tasks = state_adapter.get_tasks(workflow_run_id).await.unwrap();
    assert_eq!(initial_tasks.len(), 2); // node1 task + master task for node2

    // Now manually create the matrix tasks as the recompile function would

    // Create a task for file1.txt
    let file1_task = Task {
        id: Uuid::new_v4(),
        workflow_run_id,
        node_id: "node2".to_string(),
        status: TaskStatus::Pending,
        is_master: false,
        master_task_id: Some(master_task.id),
        matrix_values: Some(HashMap::from([(
            "file".to_string(),
            serde_json::to_value("file1.txt").unwrap(),
        )])),
        started_at: None,
        ended_at: None,
        error: None,
        logs: Vec::new(),
    };

    // Create a task for file2.txt
    let file2_task = Task {
        id: Uuid::new_v4(),
        workflow_run_id,
        node_id: "node2".to_string(),
        status: TaskStatus::Pending,
        is_master: false,
        master_task_id: Some(master_task.id),
        matrix_values: Some(HashMap::from([(
            "file".to_string(),
            serde_json::to_value("file2.txt").unwrap(),
        )])),
        started_at: None,
        ended_at: None,
        error: None,
        logs: Vec::new(),
    };

    // Save both tasks
    state_adapter.save_task(&file1_task).await.unwrap();
    state_adapter.save_task(&file2_task).await.unwrap();

    // Verify all tasks are present
    let tasks = state_adapter.get_tasks(workflow_run_id).await.unwrap();
    assert_eq!(tasks.len(), 4); // node1 task + master task + 2 matrix tasks

    // Simulate a state update that removes file2.txt and adds file3.txt
    let files_updated = serde_json::json!([
        {"file": "file1.txt"},
        {"file": "file3.txt"} // file2.txt removed, file3.txt added
    ]);

    let mut updated_state = HashMap::new();
    updated_state.insert("files".to_string(), files_updated);

    // Update the state with new files
    state_adapter
        .update_state(workflow_run_id, updated_state)
        .await
        .unwrap();

    // Mark file2_task as WontDo (as the recompile function would)
    let mut fields = HashMap::new();
    fields.insert(
        "status".to_string(),
        FieldDiff {
            operation: DiffOperation::Update,
            value: Some(serde_json::to_value(TaskStatus::WontDo).unwrap()),
        },
    );

    let task_diff = TaskDiff {
        task_id: file2_task.id,
        fields,
    };

    // Apply the diff to mark file2_task as WontDo
    state_adapter.apply_task_diff(&task_diff).await.unwrap();

    // Create a new task for file3.txt (as the recompile function would)
    let file3_task = Task {
        id: Uuid::new_v4(),
        workflow_run_id,
        node_id: "node2".to_string(),
        status: TaskStatus::Pending,
        is_master: false,
        master_task_id: Some(master_task.id),
        matrix_values: Some(HashMap::from([(
            "file".to_string(),
            serde_json::to_value("file3.txt").unwrap(),
        )])),
        started_at: None,
        ended_at: None,
        error: None,
        logs: Vec::new(),
    };

    // Save the new task
    state_adapter.save_task(&file3_task).await.unwrap();

    // Verify the final task state
    let final_tasks = state_adapter.get_tasks(workflow_run_id).await.unwrap();
    assert_eq!(final_tasks.len(), 5); // node1 task + master task + 3 matrix tasks (including WontDo)

    // Verify one of the tasks is marked as WontDo
    let wontdo_tasks: Vec<&Task> = final_tasks
        .iter()
        .filter(|t| t.status == TaskStatus::WontDo)
        .collect();

    assert_eq!(wontdo_tasks.len(), 1);

    // Verify it's the file2 task that's marked as WontDo
    let file2_task_status = final_tasks
        .iter()
        .find(|t| t.id == file2_task.id)
        .map(|t| t.status)
        .unwrap();

    assert_eq!(file2_task_status, TaskStatus::WontDo);

    // Verify file1 task is still active and file3 task is new
    let active_matrix_tasks: Vec<&Task> = final_tasks
        .iter()
        .filter(|t| !t.is_master && t.status != TaskStatus::WontDo && t.matrix_values.is_some())
        .collect();

    assert_eq!(active_matrix_tasks.len(), 2);
}

#[tokio::test]
async fn test_env_var_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_env_var_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for node1 exists
    let node1_task = tasks.iter().find(|t| t.node_id == "node1").unwrap();

    // Check that the task status is valid
    assert!(
        node1_task.status == TaskStatus::Running
            || node1_task.status == TaskStatus::Completed
            || node1_task.status == TaskStatus::Failed
    );
}

#[tokio::test]
async fn test_variable_resolution_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_variable_resolution_workflow();

    // Create parameters for variable resolution
    let mut params = HashMap::new();
    params.insert("repo_name".to_string(), "example-repo".to_string());
    params.insert("branch".to_string(), "main".to_string());
    params.insert(
        "repo_url".to_string(),
        "https://github.com/example/repo".to_string(),
    );

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for node1 exists
    let node1_task = tasks.iter().find(|t| t.node_id == "node1").unwrap();

    // Check that the task status is valid
    assert!(
        node1_task.status == TaskStatus::Running
            || node1_task.status == TaskStatus::Completed
            || node1_task.status == TaskStatus::Failed
    );

    // Check that the parameters were saved
    assert_eq!(
        workflow_run.params.get("repo_name").unwrap(),
        "example-repo"
    );
    assert_eq!(workflow_run.params.get("branch").unwrap(), "main");
    assert_eq!(
        workflow_run.params.get("repo_url").unwrap(),
        "https://github.com/example/repo"
    );
}

#[tokio::test]
async fn test_invalid_workflow_run_id() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Generate a random UUID that doesn't exist
    let invalid_id = Uuid::new_v4();

    // Try to get a workflow run with an invalid ID
    let result = engine.get_workflow_run(invalid_id).await;

    // The result should be an error
    assert!(result.is_err());
}

#[tokio::test]
async fn test_workflow_with_params() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_test_workflow();

    // Create parameters
    let mut params = HashMap::new();
    params.insert("test_param".to_string(), "test_value".to_string());

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the parameters were saved
    assert_eq!(workflow_run.params.get("test_param").unwrap(), "test_value");
}

#[tokio::test]
async fn test_codemod_environment_variables() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_env_vars_test_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run completed successfully
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the environment test task
    let env_test_task = tasks.iter().find(|t| t.node_id == "env-test-node").unwrap();

    // Check that the task has completed successfully or is running
    assert!(
        env_test_task.status == TaskStatus::Completed
            || env_test_task.status == TaskStatus::Running
    );

    // If the task completed, check the logs for the environment variables
    if env_test_task.status == TaskStatus::Completed {
        // The task should have logs showing the environment variables
        assert!(!env_test_task.logs.is_empty(), "Task should have logs");

        let log_output = env_test_task.logs.join("\n");

        // Check that CODEMOD_TASK_ID is set and matches the task ID
        assert!(
            log_output.contains(&format!("CODEMOD_TASK_ID={}", env_test_task.id)),
            "CODEMOD_TASK_ID should be set to the task ID"
        );

        // Check that CODEMOD_WORKFLOW_RUN_ID is set and matches the workflow run ID
        assert!(
            log_output.contains(&format!("CODEMOD_WORKFLOW_RUN_ID={workflow_run_id}")),
            "CODEMOD_WORKFLOW_RUN_ID should be set to the workflow run ID"
        );

        // Check that the validation scripts confirm the variables are set
        assert!(
            log_output.contains("task_id_set=true"),
            "CODEMOD_TASK_ID should be detected as set"
        );
        assert!(
            log_output.contains("workflow_run_id_set=true"),
            "CODEMOD_WORKFLOW_RUN_ID should be detected as set"
        );

        // Check that the UUIDs are valid format (36 characters)
        assert!(
            log_output.contains("task_id_valid=true"),
            "CODEMOD_TASK_ID should be a valid UUID format"
        );
        assert!(
            log_output.contains("workflow_run_id_valid=true"),
            "CODEMOD_WORKFLOW_RUN_ID should be a valid UUID format"
        );
    }
}

#[tokio::test]
async fn test_codemod_environment_variables_in_matrix() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Create a matrix workflow that tests environment variables
    let workflow = Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "setup-node".to_string(),
                name: "Setup Node".to_string(),
                description: Some("Setup node".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Setup".to_string(),
                    action: StepAction::RunScript("echo 'Setup complete'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "matrix-env-test-node".to_string(),
                name: "Matrix Environment Test Node".to_string(),
                description: Some("Test environment variables in matrix".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["setup-node".to_string()],
                trigger: None,
                strategy: Some(Strategy {
                    r#type: butterflow_models::strategy::StrategyType::Matrix,
                    values: Some(vec![
                        HashMap::from([(
                            "region".to_string(),
                            serde_json::to_value("us-east").unwrap(),
                        )]),
                        HashMap::from([(
                            "region".to_string(),
                            serde_json::to_value("eu-west").unwrap(),
                        )]),
                    ]),
                    from_state: None,
                }),
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Test Environment Variables in Matrix".to_string(),
                    action: StepAction::RunScript(
                        r#"echo "Matrix region: $region"
echo "CODEMOD_TASK_ID: $CODEMOD_TASK_ID"
echo "CODEMOD_WORKFLOW_RUN_ID: $CODEMOD_WORKFLOW_RUN_ID"
echo "env_vars_in_matrix=true""#
                            .to_string(),
                    ),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    };

    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, None, None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to complete
    tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // Find the matrix tasks (should be at least 2 for the 2 regions)
    let matrix_tasks: Vec<&Task> = tasks
        .iter()
        .filter(|t| t.node_id == "matrix-env-test-node" && !t.is_master)
        .collect();

    // Should have matrix tasks for each region
    assert!(
        matrix_tasks.len() >= 2,
        "Should have matrix tasks for each region"
    );

    // Check that each matrix task has the environment variables set correctly
    for matrix_task in matrix_tasks {
        if matrix_task.status == TaskStatus::Completed {
            assert!(!matrix_task.logs.is_empty(), "Matrix task should have logs");

            let log_output = matrix_task.logs.join("\n");

            // Check that CODEMOD_TASK_ID is set to this specific matrix task's ID
            assert!(
                log_output.contains(&format!("CODEMOD_TASK_ID: {}", matrix_task.id)),
                "CODEMOD_TASK_ID should be set to the matrix task ID in matrix task {}",
                matrix_task.id
            );

            // Check that CODEMOD_WORKFLOW_RUN_ID is set correctly
            assert!(
                log_output.contains(&format!("CODEMOD_WORKFLOW_RUN_ID: {workflow_run_id}")),
                "CODEMOD_WORKFLOW_RUN_ID should be set correctly in matrix task {}",
                matrix_task.id
            );

            // Check that the matrix variable is also present
            assert!(
                log_output.contains("Matrix region:")
                    && (log_output.contains("us-east") || log_output.contains("eu-west")),
                "Matrix region should be set in matrix task {}",
                matrix_task.id
            );
        }
    }
}

#[tokio::test]
async fn test_cyclic_dependency_workflow() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Create a workflow with a cyclic dependency
    let workflow = Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![
            Node {
                id: "node1".to_string(),
                name: "Node 1".to_string(),
                description: Some("Test node 1".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node2".to_string()], // Depends on node2
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Hello, World!'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
            Node {
                id: "node2".to_string(),
                name: "Node 2".to_string(),
                description: Some("Test node 2".to_string()),
                r#type: NodeType::Automatic,
                depends_on: vec!["node1".to_string()], // Depends on node1, creating a cycle
                trigger: None,
                strategy: None,
                runtime: Some(Runtime {
                    r#type: RuntimeType::Direct,
                    image: None,
                    working_dir: None,
                    user: None,
                    network: None,
                    options: None,
                }),
                steps: vec![Step {
                    name: "Step 1".to_string(),
                    action: StepAction::RunScript("echo 'Node 2 executed'".to_string()),
                    env: None,
                }],
                env: HashMap::new(),
            },
        ],
    };

    let params = HashMap::new();

    // Running this workflow should fail due to the cyclic dependency
    let result = engine
        .run_workflow(workflow, params, None, None, None)
        .await;

    // The result should be an error
    assert!(result.is_err());
}

#[tokio::test]
async fn test_invalid_template_reference() {
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    // Create a workflow with an invalid template reference
    let workflow = Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "node1".to_string(),
            name: "Node 1".to_string(),
            description: Some("Test node 1".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                name: "Step 1".to_string(),
                action: StepAction::UseTemplate(butterflow_models::step::TemplateUse {
                    template: "non-existent-template".to_string(), // This template doesn't exist
                    inputs: HashMap::new(),
                }),
                env: None,
            }],
            env: HashMap::new(),
        }],
    };

    let params = HashMap::new();

    // Running this workflow should fail due to the invalid template reference
    let result = engine
        .run_workflow(workflow, params, None, None, None)
        .await;

    // The result should be an error
    assert!(result.is_err());
}

// Helper function for AST grep tests
fn create_test_file(dir: &std::path::Path, name: &str, content: &str) -> std::path::PathBuf {
    let file_path = dir.join(name);
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent).unwrap();
    }
    fs::write(&file_path, content).unwrap();
    file_path
}

#[tokio::test]
async fn test_execute_ast_grep_step() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create test JavaScript files
    create_test_file(
        temp_path,
        "src/app.js",
        r#"
function main() {
    console.log("Starting app");
    var count = 0;
    console.log("Count:", count);
}
"#,
    );

    create_test_file(
        temp_path,
        "src/utils.js",
        r#"
function helper() {
    console.log("Helper function");
    let data = getData();
    return data;
}
"#,
    );

    // Create ast-grep config
    create_test_file(
        temp_path,
        "ast-grep-rules.yaml",
        r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
---
id: var-declaration
language: javascript
rule:
  pattern: var $VAR = $VALUE
message: "Found var declaration"
"#,
    );

    // Create a simple workflow with ast-grep step
    let ast_grep_step = UseAstGrep {
        include: Some(vec!["src/**/*.js".to_string()]),
        exclude: None,
        base_path: None,
        config_file: "ast-grep-rules.yaml".to_string(),
        allow_dirty: Some(false),
    };

    let step = Step {
        name: "Test AST Grep".to_string(),
        action: StepAction::AstGrep(ast_grep_step),
        env: None,
    };

    // Create a simple node for testing
    let _node = Node {
        id: "test-node".to_string(),
        name: "Test Node".to_string(),
        description: None,
        r#type: butterflow_models::node::NodeType::Automatic,
        runtime: None,
        depends_on: vec![],
        steps: vec![step],
        strategy: None,
        trigger: None,
        env: HashMap::new(),
    };

    // Create a dummy task
    let _task = Task {
        id: Uuid::new_v4(),
        workflow_run_id: Uuid::new_v4(),
        node_id: "test-node".to_string(),
        status: TaskStatus::Pending,
        is_master: false,
        master_task_id: None,
        matrix_values: None,
        started_at: None,
        ended_at: None,
        logs: vec![],
        error: None,
    };

    // Create engine and test execution
    let engine = Engine::new();
    let result = engine
        .execute_ast_grep_step_with_dir(
            "test".to_string(),
            &UseAstGrep {
                include: Some(vec!["src/**/*.js".to_string()]),
                exclude: None,
                base_path: None,
                config_file: "ast-grep-rules.yaml".to_string(),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "AST grep step should execute successfully: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_ast_grep_step_with_typescript() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create test TypeScript file
    create_test_file(
        temp_path,
        "src/component.ts",
        r#"
interface User {
    name: string;
    age: number;
}

function greetUser(user: User): void {
    console.log(`Hello, ${user.name}!`);
}

const createUser = (name: string, age: number): User => {
    return { name, age };
};
"#,
    );

    // Create ast-grep config for TypeScript
    create_test_file(
        temp_path,
        "ts-rules.yaml",
        r#"id: console-log
language: typescript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
---
id: interface-declaration
language: typescript
rule:
  pattern: interface $NAME { $$$ }
message: "Found interface declaration"
"#,
    );

    // Create engine and test execution
    let engine = Engine::new();
    let result = engine
        .execute_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseAstGrep {
                include: Some(vec!["src/**/*.ts".to_string()]),
                exclude: None,
                base_path: None,
                config_file: "ts-rules.yaml".to_string(),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "TypeScript AST grep step should execute successfully: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_ast_grep_step_nonexistent_config() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create test file but no config
    create_test_file(temp_path, "test.js", "console.log('test');");

    // Create engine and test execution with nonexistent config
    let engine = Engine::new();
    let result = engine
        .execute_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseAstGrep {
                include: Some(vec!["test.js".to_string()]),
                exclude: None,
                base_path: None,
                config_file: "nonexistent.yaml".to_string(),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Should fail gracefully
    assert!(result.is_err(), "Should fail with nonexistent config file");
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("AST grep config file not found"));
}

#[tokio::test]
async fn test_execute_ast_grep_step_no_matches() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create test file with no console.log
    create_test_file(
        temp_path,
        "test.js",
        r#"
function add(a, b) {
    return a + b;
}

let result = add(1, 2);
"#,
    );

    // Create config that looks for console.log
    create_test_file(
        temp_path,
        "rules.yaml",
        r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
"#,
    );

    // Create engine and test execution
    let engine = Engine::new();
    let result = engine
        .execute_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseAstGrep {
                include: Some(vec!["test.js".to_string()]),
                exclude: None,
                base_path: None,
                config_file: "rules.yaml".to_string(),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Should succeed even with no matches
    assert!(
        result.is_ok(),
        "Should succeed even with no matches: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_js_ast_grep_step() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a simple JavaScript codemod file
    create_test_file(
        temp_path,
        "codemod.js",
        r#"
import { CallExpression } from '@ast-grep/napi';

export default function transform(ast) {
  return ast
    .findAll({ rule: { pattern: 'console.log($$$)' } })
    .replace('logger.info($$$)');
}
"#,
    );

    // Create test files to transform
    create_test_file(
        temp_path,
        "src/app.js",
        r#"
function main() {
    console.log("Starting app");
    var count = 0;
    console.log("Count:", count);
}
"#,
    );

    create_test_file(
        temp_path,
        "src/utils.js",
        r#"
function helper() {
    console.log("Helper function");
    let data = getData();
    return data;
}
"#,
    );

    // Create engine and test execution
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "codemod.js".to_string(),
                base_path: Some("src".to_string()),
                include: Some(vec!["**/*.js".to_string()]),
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(false),
                max_threads: Some(2),
                dry_run: Some(false),
                language: Some("javascript".to_string()),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "JS AST grep step should execute successfully: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_with_typescript() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a TypeScript codemod file
    create_test_file(
        temp_path,
        "ts-codemod.js",
        r#"
export default function transform(ast) {
  return ast
    .findAll({ 
      rule: { 
        pattern: 'interface $NAME { $$$ }' 
      } 
    })
    .replace('type $NAME = { $$$ }');
}
"#,
    );

    // Create test TypeScript files
    create_test_file(
        temp_path,
        "src/types.ts",
        r#"
interface User {
    name: string;
    age: number;
}

interface Product {
    id: number;
    title: string;
}
"#,
    );

    create_test_file(
        temp_path,
        "src/models.ts",
        r#"
interface ApiResponse {
    data: any;
    status: number;
}
"#,
    );

    // Create engine and test execution
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "ts-codemod.js".to_string(),
                base_path: Some("src".to_string()),
                include: Some(vec!["**/*.ts".to_string(), "**/*.tsx".to_string()]),
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(false),
                max_threads: Some(4),
                dry_run: Some(false),
                language: Some("typescript".to_string()),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "TypeScript JS AST grep step should execute successfully: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_dry_run() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a codemod file
    create_test_file(
        temp_path,
        "dry-run-codemod.js",
        r#"
export default function transform(ast) {
  return ast
    .findAll({ rule: { pattern: 'var $VAR = $VALUE' } })
    .replace('const $VAR = $VALUE');
}
"#,
    );

    // Create test file
    create_test_file(
        temp_path,
        "test.js",
        r#"
var name = "test";
var count = 0;
"#,
    );

    // Create engine and test execution with dry run
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "dry-run-codemod.js".to_string(),
                base_path: None, // Use current directory
                include: Some(vec!["**/*.js".to_string()]),
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(false),
                max_threads: None,   // Use default
                dry_run: Some(true), // Enable dry run
                language: Some("javascript".to_string()),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "Dry run JS AST grep step should execute successfully: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_nonexistent_js_file() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create test file but no codemod
    create_test_file(temp_path, "test.js", "console.log('test');");

    // Create engine and test execution with nonexistent JavaScript file
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "nonexistent-codemod.js".to_string(),
                base_path: None,
                include: None,
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(false),
                max_threads: None,
                dry_run: Some(false),
                language: None,
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Should fail gracefully
    assert!(result.is_err(), "Should fail with nonexistent JS file");
    assert!(result.unwrap_err().to_string().contains("JavaScript file"));
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_with_gitignore() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a codemod file
    create_test_file(
        temp_path,
        "gitignore-codemod.js",
        r#"
export default function transform(ast) {
  return ast
    .findAll({ rule: { pattern: 'console.log($$$)' } })
    .replace('logger.info($$$)');
}
"#,
    );

    // Create .gitignore file
    create_test_file(
        temp_path,
        ".gitignore",
        r#"
node_modules/
*.log
build/
"#,
    );

    // Create test files in different locations
    create_test_file(temp_path, "src/app.js", "console.log('main app');");
    create_test_file(temp_path, "build/dist.js", "console.log('built file');");
    create_test_file(
        temp_path,
        "node_modules/lib.js",
        "console.log('dependency');",
    );

    // Create engine and test execution respecting gitignore
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "gitignore-codemod.js".to_string(),
                base_path: None,
                include: Some(vec!["**/*.js".to_string()]),
                exclude: None,
                no_gitignore: Some(false), // Respect gitignore
                include_hidden: Some(false),
                max_threads: Some(1),
                dry_run: Some(false),
                language: Some("javascript".to_string()),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "JS AST grep step with gitignore should execute successfully: {result:?}"
    );

    // Test without respecting gitignore
    let result_no_gitignore = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "gitignore-codemod.js".to_string(),
                base_path: None,
                include: Some(vec!["**/*.js".to_string()]),
                exclude: None,
                no_gitignore: Some(true), // Don't respect gitignore
                include_hidden: Some(false),
                max_threads: Some(1),
                dry_run: Some(false),
                language: Some("javascript".to_string()),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Should also succeed
    assert!(
        result_no_gitignore.is_ok(),
        "JS AST grep step without gitignore should execute successfully: {result_no_gitignore:?}"
    );
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_with_hidden_files() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a codemod file
    create_test_file(
        temp_path,
        "hidden-codemod.js",
        r#"
export default function transform(ast) {
  return ast
    .findAll({ rule: { pattern: 'const $VAR = $VALUE' } })
    .replace('let $VAR = $VALUE');
}
"#,
    );

    // Create hidden file
    create_test_file(temp_path, ".hidden.js", "const secret = 'hidden';");

    // Create regular file
    create_test_file(temp_path, "regular.js", "const normal = 'visible';");

    // Create engine and test execution including hidden files
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "hidden-codemod.js".to_string(),
                base_path: None,
                include: Some(vec!["**/*.js".to_string()]),
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(true), // Include hidden files
                max_threads: Some(1),
                dry_run: Some(false),
                language: Some("javascript".to_string()),
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Assert the step executed successfully
    assert!(
        result.is_ok(),
        "JS AST grep step with hidden files should execute successfully: {result:?}"
    );
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_invalid_max_threads() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a simple codemod file
    create_test_file(
        temp_path,
        "codemod.js",
        r#"
export default function transform(ast) {
  return ast;
}
"#,
    );

    // Create test file
    create_test_file(temp_path, "test.js", "console.log('test');");

    // Create engine and test execution with invalid max_threads
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "codemod.js".to_string(),
                base_path: None,
                include: None,
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(false),
                max_threads: Some(0), // Invalid: must be > 0
                dry_run: Some(false),
                language: None,
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Should fail gracefully
    assert!(result.is_err(), "Should fail with invalid max_threads");
    assert!(result
        .unwrap_err()
        .to_string()
        .contains("max-threads must be greater than 0"));
}

#[tokio::test]
async fn test_execute_js_ast_grep_step_invalid_language() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create a simple codemod file
    create_test_file(
        temp_path,
        "codemod.js",
        r#"
export default function transform(ast) {
  return ast;
}
"#,
    );

    // Create test file
    create_test_file(temp_path, "test.js", "console.log('test');");

    // Create engine and test execution with invalid language
    let engine = Engine::new();
    let result = engine
        .execute_js_ast_grep_step_with_dir(
            "test-node".to_string(),
            &UseJSAstGrep {
                js_file: "codemod.js".to_string(),
                base_path: None,
                include: None,
                exclude: None,
                no_gitignore: Some(false),
                include_hidden: Some(false),
                max_threads: None,
                dry_run: Some(false),
                language: Some("invalid-language".to_string()), // Invalid language
                allow_dirty: Some(false),
            },
            Some(temp_path),
            None,
            None,
        )
        .await;

    // Should fail gracefully
    assert!(result.is_err(), "Should fail with invalid language");
    assert!(result.unwrap_err().to_string().contains("Invalid language"));
}

// Helper function to create a workflow with JSAstGrep step
fn create_js_ast_grep_workflow() -> Workflow {
    Workflow {
        version: "1".to_string(),
        state: None,
        templates: vec![],
        nodes: vec![Node {
            id: "js-ast-grep-node".to_string(),
            name: "JS AST Grep Node".to_string(),
            description: Some("Test node for JS AST grep".to_string()),
            r#type: NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: Some(Runtime {
                r#type: RuntimeType::Direct,
                image: None,
                working_dir: None,
                user: None,
                network: None,
                options: None,
            }),
            steps: vec![Step {
                name: "JS AST Grep Step".to_string(),
                action: StepAction::JSAstGrep(UseJSAstGrep {
                    js_file: "codemod.js".to_string(),
                    base_path: Some("src".to_string()),
                    include: Some(vec!["**/*.js".to_string()]),
                    exclude: None,
                    no_gitignore: Some(false),
                    include_hidden: Some(false),
                    max_threads: Some(2),
                    dry_run: Some(false),
                    language: Some("javascript".to_string()),
                    allow_dirty: Some(false),
                }),
                env: None,
            }],
            env: HashMap::new(),
        }],
    }
}

#[tokio::test]
async fn test_js_ast_grep_workflow_execution() {
    let temp_dir = TempDir::new().unwrap();
    let temp_path = temp_dir.path();

    // Create codemod and test files
    create_test_file(
        temp_path,
        "codemod.js",
        r#"
import { CallExpression } from '@ast-grep/napi';

export default function transform(ast) {
  return ast
    .findAll({ rule: { pattern: 'console.log($$$)' } })
    .replace('logger.info($$$)');
}
"#,
    );

    create_test_file(temp_path, "src/app.js", "console.log('Hello, World!');");

    // Create engine with workflow
    let state_adapter = Box::new(MockStateAdapter::new());
    let engine = Engine::with_state_adapter(state_adapter);

    let workflow = create_js_ast_grep_workflow();
    let params = HashMap::new();

    let workflow_run_id = engine
        .run_workflow(workflow, params, Some(temp_path.to_path_buf()), None, None)
        .await
        .unwrap();

    // Allow some time for the workflow to start
    tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;

    // Get the workflow run
    let workflow_run = engine.get_workflow_run(workflow_run_id).await.unwrap();

    // Check that the workflow run is running or completed
    assert!(
        workflow_run.status == WorkflowStatus::Running
            || workflow_run.status == WorkflowStatus::Completed
    );

    // Get the tasks
    let tasks = engine.get_tasks(workflow_run_id).await.unwrap();

    // There should be at least 1 task
    assert!(!tasks.is_empty());

    // Check that the task for the JS AST grep node exists
    let js_ast_grep_task = tasks
        .iter()
        .find(|t| t.node_id == "js-ast-grep-node")
        .unwrap();

    // Check that the task status is valid
    assert!(
        js_ast_grep_task.status == TaskStatus::Running
            || js_ast_grep_task.status == TaskStatus::Completed
            || js_ast_grep_task.status == TaskStatus::Failed
    );
}
