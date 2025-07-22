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
    validate_workflow(&args.workflow)?;
    validate_codemod_manifest_structure(
        &args.workflow,
        &utils::parse_workflow_file(&args.workflow)?,
    )?;
}

fn calculate_package_size(package_path: &Path) -> Result<u64> {
    let mut total_size = 0;

    for entry in WalkDir::new(package_path)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .filter(|e| should_include_file(e.path(), package_path))
    {
        total_size += entry.metadata()?.len();
    }

    Ok(total_size)
}

pub fn validate_codemod_manifest_structure(
    package_path: &Path,
    manifest: &CodemodManifest,
) -> Result<()> {
    // Check required files
    let (workflow_path, _) = utils::resolve_workflow_source(&manifest.workflow)
        .context("Failed to resolve workflow source")?;

    // Validate workflow file
    utils::parse_workflow_file(&workflow_path).context(format!(
        "Failed to parse workflow file: {}",
        workflow_path.display()
    ))?;

    // Check optional files
    if let Some(readme) = &manifest.readme {
        let readme_path = package_path.join(readme);
        if !readme_path.exists() {
            warn!("README file not found: {}", readme_path.display());
        }
    }

    // Validate codemod name format
    if !is_valid_codemod_name(&manifest.name) {
        return Err(anyhow!("Invalid codemod name: {}. Must contain only lowercase letters, numbers, hyphens, and underscores.", manifest.name));
    }

    // Validate version format (semver)
    if !is_valid_semver(&manifest.version) {
        return Err(anyhow!(
            "Invalid version: {}. Must be valid semantic version (x.y.z).",
            manifest.version
        ));
    }

    // Check package size
    let package_size = calculate_package_size(package_path)?;
    const MAX_PACKAGE_SIZE: u64 = 50 * 1024 * 1024; // 50MB

    if package_size > MAX_PACKAGE_SIZE {
        return Err(anyhow!(
            "Package too large: {} bytes. Maximum allowed: {} bytes.",
            package_size,
            MAX_PACKAGE_SIZE
        ));
    }

    info!("Package validation successful");
    Ok(())
}

fn validate_workflow(workflow_path: &Path) -> Result<()> {
    // Parse workflow file
    let workflow = utils::parse_workflow_file(workflow_path).context(format!(
        "Failed to parse workflow file: {}",
        workflow_path.display()
    ))?;

    // Validate workflow
    utils::validate_workflow(&workflow).context("Workflow validation failed")?;

    // Get the base directory for resolving relative paths
    let base_dir = workflow_path.parent().unwrap_or(Path::new("."));

    workflow
        .validate_js_ast_grep_files(base_dir)
        .context("js-ast-grep file validation failed")?;

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
    info!("Matrix strategies: Valid ({matrix_nodes} matrix nodes)");

    // Count state schema definitions
    let state_schema_count = workflow.state.as_ref().map(|s| s.schema.len()).unwrap_or(0);
    info!("State schema: Valid ({state_schema_count} schema definitions)");

    Ok(())
}

fn is_valid_codemod_name(name: &str) -> bool {
    !name.is_empty()
        && name.len() <= 50
        && name
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-' || c == '_')
        && !name.starts_with('-')
        && !name.ends_with('-')
}

fn is_valid_semver(version: &str) -> bool {
    // Basic semver validation (x.y.z format)
    let parts: Vec<&str> = version.split('.').collect();
    if parts.len() != 3 {
        return false;
    }

    parts.iter().all(|part| {
        part.chars().all(|c| c.is_ascii_digit())
            && !part.is_empty()
            && (*part == "0" || !part.starts_with('0'))
    })
}
