use anyhow::Result;
use butterflow_core::config::WorkflowRunConfig;
use clap::Args;
use console::style;
use log::info;
use rand::Rng;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::Command as ProcessCommand;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::auth_provider::CliAuthProvider;
use crate::progress_bar::download_progress_bar;
use crate::workflow_runner::run_workflow;
use butterflow_core::engine::{Engine, GLOBAL_STATS};
use butterflow_core::registry::{RegistryClient, RegistryError};
use codemod_sandbox::sandbox::engine::ExecutionStats;
use codemod_telemetry::send_event::{BaseEvent, TelemetrySender};

#[derive(Args, Debug)]
pub struct Command {
    /// Package name with optional version (e.g., @org/package@1.0.0)
    #[arg(value_name = "PACKAGE")]
    package: String,

    /// Registry URL
    #[arg(long)]
    registry: Option<String>,

    /// Force re-download even if cached
    #[arg(long)]
    force: bool,

    /// Dry run mode - don't make actual changes
    #[arg(long)]
    dry_run: bool,

    /// Additional arguments to pass to the codemod
    #[arg(last = true)]
    args: Vec<String>,

    /// Allow dirty git status
    #[arg(long)]
    allow_dirty: bool,

    /// Optional target path to run the codemod on
    #[arg(long)]
    target_path: Option<PathBuf>,
}

pub async fn handler(
    engine: &Engine,
    args: &Command,
    telemetry: &dyn TelemetrySender,
) -> Result<()> {
    // Create auth provider
    let auth_provider = CliAuthProvider::new()?;

    // Get cache directory and default registry from config
    let config = auth_provider.storage.load_config()?;

    let registry_url = args
        .registry
        .as_ref()
        .unwrap_or(&config.default_registry)
        .clone();

    let registry_client = RegistryClient::default();

    // Resolve the package (local path or registry package)
    let download_progress_bar = Some(download_progress_bar());
    println!(
        "{} 🔍 Resolving package from registry: {} ...",
        style("[1/2]").bold().dim(),
        registry_url
    );
    let resolved_package = match registry_client
        .resolve_package(
            &args.package,
            Some(&registry_url),
            args.force,
            download_progress_bar,
        )
        .await
    {
        Ok(package) => package,
        Err(RegistryError::LegacyPackage { package }) => {
            info!("Package {package} is legacy, running npx codemod@legacy");
            println!(
                "{}",
                style(format!("⚠️ Package {package} is legacy")).yellow()
            );
            println!(
                "{} 🏁 Running codemod: {}",
                style("[2/2]").bold().dim(),
                args.package,
            );
            return run_legacy_codemod(args).await;
        }
        Err(e) => return Err(anyhow::anyhow!("Registry error: {}", e)),
    };

    info!(
        "Resolved codemod package: {} -> {}",
        args.package,
        resolved_package.package_dir.display()
    );

    println!(
        "{} 🏁 Running codemod: {}",
        style("[2/2]").bold().dim(),
        args.package,
    );

    // Execute the codemod
    let stats = execute_codemod(
        engine,
        &resolved_package.package_dir,
        args.target_path.as_ref().unwrap_or(&PathBuf::from(".")),
        &args.args,
        args.dry_run,
    )
    .await;

    let cli_version = env!("CARGO_PKG_VERSION");
    if let Err(e) = stats {
        let _ = telemetry
            .send_event(
                BaseEvent {
                    kind: "failedToExecuteCommand".to_string(),
                    properties: HashMap::from([
                        ("codemodName".to_string(), args.package.clone()),
                        ("cliVersion".to_string(), cli_version.to_string()),
                        (
                            "commandName".to_string(),
                            "codemod.executeCodemod".to_string(),
                        ),
                    ]),
                },
                None,
            )
            .await;
        return Err(e);
    }

    let stats = stats.unwrap();
    println!("\n📝 Modified files: {:?}", stats.files_modified);
    println!("✅ Unmodified files: {:?}", stats.files_unmodified);
    println!("❌ Files with errors: {:?}", stats.files_with_errors);

    let cli_version = env!("CARGO_PKG_VERSION");
    let execution_id: [u8; 20] = rand::thread_rng().gen();
    let execution_id = base64::Engine::encode(
        &base64::engine::general_purpose::URL_SAFE_NO_PAD,
        execution_id,
    );

    let _ = telemetry
        .send_event(
            BaseEvent {
                kind: "codemodExecuted".to_string(),
                properties: HashMap::from([
                    ("codemodName".to_string(), args.package.clone()),
                    ("executionId".to_string(), execution_id.clone()),
                    ("fileCount".to_string(), stats.files_modified.to_string()),
                    ("cliVersion".to_string(), cli_version.to_string()),
                ]),
            },
            None,
        )
        .await;

    Ok(())
}

pub async fn run_legacy_codemod_with_raw_args(raw_args: &[String]) -> Result<()> {
    let mut cmd = ProcessCommand::new("npx");
    cmd.arg("codemod@legacy");
    cmd.args(raw_args);

    info!(
        "Executing: npx codemod@legacy with args: {:?}",
        cmd.get_args().collect::<Vec<_>>()
    );

    let status = cmd.status()?;

    if !status.success() {
        return Err(anyhow::anyhow!(
            "Legacy codemod command failed with exit code: {:?}",
            status.code()
        ));
    }

    Ok(())
}

async fn run_legacy_codemod(args: &Command) -> Result<()> {
    let mut legacy_args = vec![args.package.clone()];
    legacy_args.push(
        args.target_path
            .as_ref()
            .map_or("".to_string(), |v| v.to_string_lossy().to_string()),
    );
    legacy_args.extend(args.args.iter().cloned());
    run_legacy_codemod_with_raw_args(&legacy_args).await
}

async fn execute_codemod(
    engine: &Engine,
    package_dir: &Path,
    target_path: &Path,
    additional_args: &[String],
    dry_run: bool,
) -> Result<ExecutionStats> {
    let workflow_path = package_dir.join("workflow.yaml");

    info!(
        "Executing codemod on {} {}",
        target_path.display(),
        if dry_run { "(dry run)" } else { "" }
    );

    // Create parameters map from additional args
    let mut params = std::collections::HashMap::new();
    params.insert(
        "target_path".to_string(),
        target_path.to_string_lossy().to_string(),
    );

    if dry_run {
        params.insert("dry_run".to_string(), "true".to_string());
    }

    // Parse additional arguments in key=value format
    for arg in additional_args {
        if let Some((key, value)) = arg.split_once('=') {
            params.insert(key.to_string(), value.to_string());
        }
    }

    // Create workflow run configuration
    let config = WorkflowRunConfig {
        workflow_file_path: workflow_path,
        bundle_path: package_dir.to_path_buf(),
        target_path: target_path.to_path_buf(),
        params,
        wait_for_completion: true,
        progress_callback: Arc::new(None),
        pre_run_callback: Arc::new(None),
        registry_client: RegistryClient::default(),
        dry_run,
    };

    // Run workflow using the extracted workflow runner
    run_workflow(engine, config).await?;
    let stats = GLOBAL_STATS
        .get_or_init(|| Mutex::new(ExecutionStats::default()))
        .lock()
        .await
        .clone();

    Ok(stats)
}
