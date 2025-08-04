use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_core::utils;
use butterflow_models::{Task, TaskStatus, WorkflowStatus};
use log::{error, info};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command;
use uuid::Uuid;
pub struct WorkflowRunConfig {
    pub workflow_file_path: PathBuf,
    pub bundle_path: PathBuf,
    pub params: HashMap<String, String>,
    pub wait_for_completion: bool,
}

pub fn dry_run_callback(old: &str, new: &str, target_file_path: &Path) {
    let filename = target_file_path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy();

    let path = target_file_path.display();

    let temp_dir = std::env::temp_dir();
    let old_file = temp_dir.join(format!("old_{filename}"));
    let new_file = temp_dir.join(format!("new_{filename}"));

    if let Err(e) = std::fs::write(&old_file, old) {
        eprintln!("Failed to write old content: {e}");
        return;
    }
    if let Err(e) = std::fs::write(&new_file, new) {
        eprintln!("Failed to write new content: {e}");
        return;
    }

    let output = Command::new("diff")
        .arg("-u")
        .arg(&old_file)
        .arg(&new_file)
        .output();

    match output {
        Ok(result) => {
            if result.status.success() || result.status.code() == Some(1) {
                if let Ok(diff_output) = String::from_utf8(result.stdout) {
                    let lines = diff_output.lines();
                    println!("\nComparing changes in: \x1b[1;34m{path}\x1b[0m");
                    for line in lines {
                        if line.starts_with("+++") || line.starts_with("---") {
                            continue;
                        } else if line.starts_with("@@") {
                            println!("\x1b[36m{line}\x1b[0m");
                        } else if line.starts_with('+') {
                            println!("\x1b[32m{line}\x1b[0m");
                        } else if line.starts_with('-') {
                            println!("\x1b[31m{line}\x1b[0m");
                        } else {
                            println!("{line}");
                        }
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("Failed to run diff command: {e}");
            println!("\nComparing changes in: \x1b[1;34m{path}\x1b[0m");

            let old_lines: Vec<&str> = old.lines().collect();
            let new_lines: Vec<&str> = new.lines().collect();
            let max_lines = old_lines.len().max(new_lines.len());

            for i in 0..max_lines {
                let old_line = old_lines.get(i).unwrap_or(&"");
                let new_line = new_lines.get(i).unwrap_or(&"");

                if old_line != new_line {
                    if !old_line.is_empty() {
                        println!("\x1b[31m-{old_line}\x1b[0m");
                    }
                    if !new_line.is_empty() {
                        println!("\x1b[32m+{new_line}\x1b[0m");
                    }
                } else {
                    println!("{old_line}");
                }
            }
        }
    }

    let _ = std::fs::remove_file(&old_file);
    let _ = std::fs::remove_file(&new_file);
    println!();
}
/// Run a workflow with the given configuration
pub async fn run_workflow(engine: &Engine, config: WorkflowRunConfig) -> Result<String> {
    // Parse workflow file
    let workflow = utils::parse_workflow_file(&config.workflow_file_path).context(format!(
        "Failed to parse workflow file: {}",
        config.workflow_file_path.display()
    ))?;

    // Run workflow
    let dry_run_callback = Some(std::sync::Arc::new(dry_run_callback)
        as std::sync::Arc<dyn Fn(&str, &str, &Path) + Send + Sync>);
    let workflow_run_id = engine
        .run_workflow(
            workflow,
            config.params,
            Some(config.bundle_path),
            &dry_run_callback,
        )
        .await
        .context("Failed to run workflow")?;

    info!("Workflow started with ID: {workflow_run_id}");

    if config.wait_for_completion {
        wait_for_workflow_completion(engine, workflow_run_id.to_string()).await?;
    }

    Ok(workflow_run_id.to_string())
}

/// Wait for workflow to complete or pause
pub async fn wait_for_workflow_completion(engine: &Engine, workflow_run_id: String) -> Result<()> {
    loop {
        // Get workflow status
        let status = engine
            .get_workflow_status(workflow_run_id.clone().parse::<Uuid>()?)
            .await
            .context("Failed to get workflow status")?;

        match status {
            WorkflowStatus::Completed => {
                info!("Workflow completed successfully");
                break;
            }
            WorkflowStatus::Failed => {
                error!("Workflow failed");
                return Err(anyhow::anyhow!("Workflow failed"));
            }
            WorkflowStatus::AwaitingTrigger => {
                // Get tasks awaiting trigger
                let tasks = engine
                    .get_tasks(workflow_run_id.clone().parse::<Uuid>()?)
                    .await
                    .context("Failed to get tasks")?;

                let awaiting_tasks: Vec<&Task> = tasks
                    .iter()
                    .filter(|t| t.status == TaskStatus::AwaitingTrigger)
                    .collect();

                info!("Workflow paused: Manual triggers required");
                info!("");
                info!("Workflow is awaiting manual triggers for the following tasks:");
                for task in awaiting_tasks {
                    info!("- {} ({})", task.id, task.node_id);
                }
                info!("");
                info!("Use 'butterflow status -i {workflow_run_id}' to check status");
                info!(
                    "Run 'butterflow resume -i {workflow_run_id} -t <TASK_ID>' to trigger a specific task"
                );
                info!(
                    "Run 'butterflow resume -i {workflow_run_id} --trigger-all' to trigger all awaiting tasks"
                );
                break;
            }
            WorkflowStatus::Running => {
                // Still running, wait a bit before checking again
                tokio::time::sleep(std::time::Duration::from_secs(2)).await;
            }
            WorkflowStatus::Canceled => {
                info!("Workflow was canceled");
                break;
            }
            _ => {
                // Wait a bit before checking again
                tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
            }
        }
    }

    Ok(())
}

/// Resolves the workflow source string into the actual workflow file path
/// and the bundle's root directory path.
pub fn resolve_workflow_source(source: &str) -> Result<(PathBuf, PathBuf)> {
    let path = PathBuf::from(source);

    if !path.exists() {
        // TODO: Add registry lookup logic here in the future
        return Err(anyhow::anyhow!(
            "Workflow source path does not exist: {}",
            source
        ));
    }

    if path.is_dir() {
        let bundle_path = path.canonicalize().context(format!(
            "Failed to get absolute path for bundle directory: {}",
            path.display()
        ))?;
        // Look for default workflow files within the directory
        let default_files = [
            "workflow.yaml",
            "butterflow.yaml",
            "workflow.json",
            "butterflow.json",
        ];
        let mut workflow_file_path = None;

        for file_name in default_files.iter() {
            let potential_path = bundle_path.join(file_name);
            if potential_path.is_file() {
                workflow_file_path = Some(potential_path);
                break;
            }
        }

        match workflow_file_path {
            Some(file) => Ok((file, bundle_path)),
            None => Err(anyhow::anyhow!(
                "No default workflow file (e.g., workflow.yaml) found in directory: {}",
                bundle_path.display()
            )),
        }
    } else if path.is_file() {
        let workflow_file_path = path.canonicalize().context(format!(
            "Failed to get absolute path for workflow file: {}",
            path.display()
        ))?;
        let bundle_path = workflow_file_path
            .parent()
            .ok_or_else(|| anyhow::anyhow!("Could not get parent directory for workflow file"))?
            .to_path_buf();
        Ok((workflow_file_path, bundle_path))
    } else {
        Err(anyhow::anyhow!(
            "Workflow source path is neither a file nor a directory: {}",
            source
        ))
    }
}
