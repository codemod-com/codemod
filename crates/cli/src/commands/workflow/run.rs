use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_core::utils;
use butterflow_models::{Task, TaskStatus, WorkflowStatus};
use clap::Args;
use log::{error, info};
use std::path::PathBuf;

#[derive(Args, Debug)]
pub struct Command {
    /// Path to workflow file or directory
    #[arg(short, long, value_name = "PATH")]
    workflow: String,

    /// Workflow parameters (format: key=value)
    #[arg(long = "param", value_name = "KEY=VALUE")]
    params: Vec<String>,
}

/// Run a workflow
pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    // Resolve workflow file and bundle path
    let (workflow_file_path, bundle_path) = resolve_workflow_source(&args.workflow)?;

    // Parse workflow file
    let workflow = utils::parse_workflow_file(&workflow_file_path).context(format!(
        "Failed to parse workflow file: {}",
        workflow_file_path.display()
    ))?;

    // Parse parameters
    let params = utils::parse_params(&args.params).context("Failed to parse parameters")?;

    // Run workflow
    let workflow_run_id = engine
        .run_workflow(workflow, params, Some(bundle_path))
        .await
        .context("Failed to run workflow")?;

    info!("Workflow started with ID: {}", workflow_run_id);

    // Wait for workflow to complete or pause
    loop {
        // Get workflow status
        let status = engine
            .get_workflow_status(workflow_run_id)
            .await
            .context("Failed to get workflow status")?;

        match status {
            WorkflowStatus::Completed => {
                info!("Workflow completed successfully");
                break;
            }
            WorkflowStatus::Failed => {
                error!("Workflow failed");
                break;
            }
            WorkflowStatus::AwaitingTrigger => {
                // Get tasks awaiting trigger
                let tasks = engine
                    .get_tasks(workflow_run_id)
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
                info!(
                    "Use 'butterflow status -i {}' to check status",
                    workflow_run_id
                );
                info!(
                    "Run 'butterflow resume -i {} -t <TASK_ID>' to trigger a specific task",
                    workflow_run_id
                );
                info!(
                    "Run 'butterflow resume -i {} --trigger-all' to trigger all awaiting tasks",
                    workflow_run_id
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
fn resolve_workflow_source(source: &str) -> Result<(PathBuf, PathBuf)> {
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
