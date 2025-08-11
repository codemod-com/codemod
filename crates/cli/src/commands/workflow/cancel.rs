use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use clap::Args;
use uuid::Uuid;

#[derive(Args, Debug)]
pub struct Command {
    /// Workflow run ID
    #[arg(short, long)]
    id: Uuid,
}

/// Cancel a workflow
pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    println!("Canceling workflow run {}...", args.id);

    // Cancel workflow
    engine
        .cancel_workflow(args.id)
        .await
        .context("Failed to cancel workflow")?;

    println!("✅ Workflow run canceled successfully");

    Ok(())
}
