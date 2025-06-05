use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_core::utils;
use butterflow_models::WorkflowStatus;
use clap::Args;
use log::info;

#[derive(Args, Debug)]
pub struct Command {
    /// Number of workflow runs to show
    #[arg(short, long, default_value = "10")]
    limit: usize,
}

/// List workflow runs
pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    // Get workflow runs
    let workflow_runs = engine
        .list_workflow_runs(args.limit)
        .await
        .context("Failed to list workflow runs")?;

    if workflow_runs.is_empty() {
        info!("No workflow runs found");
        return Ok(());
    }

    info!("Recent workflow runs:");
    for workflow_run in workflow_runs {
        info!("- ID: {}", workflow_run.id);
        info!(
            "  Name: {}",
            workflow_run
                .workflow
                .nodes
                .first()
                .map(|n| n.name.as_str())
                .unwrap_or("unknown")
        );
        info!("  Status: {:?}", workflow_run.status);
        info!("  Started: {}", workflow_run.started_at);

        if let Some(ended_at) = workflow_run.ended_at {
            match workflow_run.status {
                WorkflowStatus::Completed => info!("  Completed: {}", ended_at),
                WorkflowStatus::Failed => info!("  Failed: {}", ended_at),
                WorkflowStatus::Canceled => info!("  Canceled: {}", ended_at),
                _ => {}
            }
            let duration = ended_at.signed_duration_since(workflow_run.started_at);
            info!(
                "  Duration: {}",
                utils::format_duration(duration.num_seconds() as u64)
            );
        } else {
            let duration = chrono::Utc::now().signed_duration_since(workflow_run.started_at);
            info!(
                "  Duration: {} (running)",
                utils::format_duration(duration.num_seconds() as u64)
            );
        }

        info!("");
    }

    Ok(())
}
