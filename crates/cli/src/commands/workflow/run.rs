use std::path::PathBuf;
use std::sync::Arc;

use anyhow::{Context, Result};
use butterflow_core::registry::RegistryClient;
use butterflow_core::utils;
use butterflow_core::{config::WorkflowRunConfig, engine::Engine};
use clap::Args;

use crate::workflow_runner::{resolve_workflow_source, run_workflow};

#[derive(Args, Debug)]
pub struct Command {
    /// Path to workflow file or directory
    #[arg(short, long, value_name = "PATH")]
    workflow: String,

    /// Workflow parameters (format: key=value)
    #[arg(long = "param", value_name = "KEY=VALUE")]
    params: Vec<String>,

    /// Allow dirty git status
    #[arg(long)]
    allow_dirty: bool,

    /// Optional target path to run the codemod on
    #[arg(long)]
    target_path: Option<PathBuf>,
}

/// Run a workflow
pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    // Resolve workflow file and bundle path
    let (workflow_file_path, bundle_path) = resolve_workflow_source(&args.workflow)?;

    // Parse parameters
    let params = utils::parse_params(&args.params).context("Failed to parse parameters")?;

    let target_path = args
        .target_path
        .clone()
        .unwrap_or_else(|| std::env::current_dir().unwrap());

    // Create workflow run configuration
    let config = WorkflowRunConfig {
        workflow_file_path,
        bundle_path,
        params,
        target_path,
        wait_for_completion: true,
        progress_callback: Arc::new(None),
        pre_run_callback: Arc::new(None),
        registry_client: RegistryClient::default(),
        dry_run: false,
    };

    // Run workflow using the extracted workflow runner
    run_workflow(engine, config).await?;

    Ok(())
}
