use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_models::{Task, TaskStatus, WorkflowStatus};
use clap::Args;
use log::{error, info};
use uuid::Uuid;

#[derive(Args, Debug)]
pub struct Command {
    /// Workflow run ID
    #[arg(short, long)]
    id: Uuid,

    /// Task ID to trigger (can be specified multiple times)
    #[arg(short, long)]
    task: Vec<Uuid>,

    /// Trigger all awaiting tasks
    #[arg(long)]
    trigger_all: bool,
}

/// Resume a workflow
pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    info!("Resuming workflow {}...", args.id);

    if args.trigger_all {
        // Trigger all awaiting tasks
        engine
            .trigger_all(args.id)
            .await
            .context("Failed to trigger all tasks")?;

        info!("Triggered all awaiting tasks");
    } else if !args.task.is_empty() {
        // Trigger specific tasks
        engine
            .resume_workflow(args.id, args.task.to_vec())
            .await
            .context("Failed to resume workflow")?;

        info!("Triggered {} tasks", args.task.len());
    } else {
        error!("No tasks specified to trigger. Use --task or --trigger-all");
        return Ok(());
    }

    // Wait for workflow to complete or pause again
    loop {
        // Get workflow status
        let status = engine
            .get_workflow_status(args.id)
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
                    .get_tasks(args.id)
                    .await
                    .context("Failed to get tasks")?;

                let awaiting_tasks: Vec<&Task> = tasks
                    .iter()
                    .filter(|t| t.status == TaskStatus::AwaitingTrigger)
                    .collect();

                info!("Workflow paused: Manual triggers still required");
                info!("");
                info!("Workflow is still awaiting manual triggers for the following tasks:");
                for task in awaiting_tasks {
                    info!("- {} ({})", task.id, task.node_id);
                }
                break;
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
