use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_core::utils;
use clap::Args;

use crate::workflow_runner::{resolve_workflow_source, run_workflow, WorkflowRunConfig};

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

    // Parse parameters
    let params = utils::parse_params(&args.params).context("Failed to parse parameters")?;

    // Create workflow run configuration
    let config = WorkflowRunConfig {
        workflow_file_path,
        bundle_path,
        params,
        wait_for_completion: true,
    };

    // Run workflow using the extracted workflow runner
    run_workflow(engine, config).await?;

    Ok(())
}
