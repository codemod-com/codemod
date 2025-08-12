use crate::dirty_git_check;
use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_models::{Task, TaskStatus, WorkflowStatus};
use clap::Args;
use log::error;
use tabled::settings::{object::Columns, Alignment, Modify, Style};
use tabled::Table;
use uuid::Uuid;

use super::status::TaskRow;

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
    println!("Resuming workflow {}...", args.id);

    // Create a wrapper for the git dirty check callback
    let dirty_check = dirty_git_check::dirty_check();

    if args.trigger_all {
        // Trigger all awaiting tasks
        engine
            .trigger_all(args.id)
            .await
            .context("Failed to trigger all tasks")?;

        println!("Triggered all awaiting tasks");
    } else if !args.task.is_empty() {
        // Trigger specific tasks
        engine
            .resume_workflow(args.id, args.task.to_vec())
            .await
            .context("Failed to resume workflow")?;

        println!("Triggered {} tasks", args.task.len());
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
                println!("✅ Workflow completed successfully");
                break;
            }
            WorkflowStatus::Failed => {
                println!("❌ Workflow failed");
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

                println!("⏸️ Workflow paused: Manual triggers still required");
                println!("Workflow is still awaiting manual triggers for the following tasks:");
                let mut tasks_table = Table::new(awaiting_tasks.iter().map(|t| TaskRow {
                    id: t.id.to_string(),
                    node_id: t.node_id.clone(),
                    status: format!("{:?}", t.status),
                    matrix_info: "-".to_string(),
                }));

                tasks_table
                    .with(Style::rounded())
                    .with(Modify::new(Columns::new(..)).with(Alignment::left())); // align all columns left
                println!("Tasks:");
                println!("{tasks_table}");

                break;
            }
            WorkflowStatus::Canceled => {
                println!("❌ Workflow was canceled");
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
