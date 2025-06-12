use anyhow::{Context, Result};
use butterflow_core::utils;
use butterflow_models::step::StepAction;
use clap::Args;
use log::info;
use std::path::{Path, PathBuf};

#[derive(Args, Debug)]
pub struct Command {
    /// Path to workflow file
    #[arg(short, long, value_name = "FILE")]
    workflow: PathBuf,
}

/// Validate a workflow file
pub fn handler(args: &Command) -> Result<()> {
    validate_workflow(&args.workflow)
}

fn validate_workflow(workflow_path: &Path) -> Result<()> {
    // Parse workflow file
    let workflow = utils::parse_workflow_file(workflow_path).context(format!(
        "Failed to parse workflow file: {}",
        workflow_path.display()
    ))?;

    // Validate workflow
    utils::validate_workflow(&workflow).context("Workflow validation failed")?;

    info!("✓ Workflow definition is valid");
    info!("Schema validation: Passed");
    info!(
        "Node dependencies: Valid ({} nodes, {} dependency relationships)",
        workflow.nodes.len(),
        workflow
            .nodes
            .iter()
            .map(|n| n.depends_on.len())
            .sum::<usize>()
    );
    info!(
        "Template references: Valid ({} templates, {} references)",
        workflow.templates.len(),
        workflow
            .nodes
            .iter()
            .flat_map(|n| n.steps.iter())
            .filter_map(|s| {
                match &s.action {
                    StepAction::UseTemplate(template_use) => Some(template_use),
                    _ => None,
                }
            })
            .count()
    );

    // Count matrix nodes
    let matrix_nodes = workflow
        .nodes
        .iter()
        .filter(|n| n.strategy.is_some())
        .count();
    info!("Matrix strategies: Valid ({} matrix nodes)", matrix_nodes);

    // Count state schema definitions
    let state_schema_count = workflow.state.as_ref().map(|s| s.schema.len()).unwrap_or(0);
    info!(
        "State schema: Valid ({} schema definitions)",
        state_schema_count
    );

    Ok(())
}
