use anyhow::{Context, Result};
use butterflow_models::step::StepAction;
use clap::{Parser, Subcommand};
use log::{error, info};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;

use butterflow_core::engine::Engine;
use butterflow_core::utils;
use butterflow_models::{Task, TaskStatus, WorkflowStatus};
use butterflow_state::ApiStateAdapter;

#[derive(Parser)]
#[command(name = "butterflow")]
#[command(about = "A self-hostable workflow engine for code transformations", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Path to configuration file
    #[arg(short, long, value_name = "FILE")]
    config: Option<PathBuf>,

    /// Verbose output
    #[arg(short, long)]
    verbose: bool,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a workflow
    Run {
        /// Path to workflow file
        #[arg(short, long, value_name = "FILE")]
        workflow: PathBuf,

        /// Workflow parameters (format: key=value)
        #[arg(long = "param", value_name = "KEY=VALUE")]
        params: Vec<String>,
    },

    /// Resume a paused workflow
    Resume {
        /// Workflow run ID
        #[arg(short, long)]
        id: Uuid,

        /// Task ID to trigger (can be specified multiple times)
        #[arg(short, long)]
        task: Vec<Uuid>,

        /// Trigger all awaiting tasks
        #[arg(long)]
        trigger_all: bool,
    },

    /// Validate a workflow file
    Validate {
        /// Path to workflow file
        #[arg(short, long, value_name = "FILE")]
        workflow: PathBuf,
    },

    /// Show workflow run status
    Status {
        /// Workflow run ID
        #[arg(short, long)]
        id: Uuid,
    },

    /// List workflow runs
    List {
        /// Number of workflow runs to show
        #[arg(short, long, default_value = "10")]
        limit: usize,
    },

    /// Cancel a workflow run
    Cancel {
        /// Workflow run ID
        #[arg(short, long)]
        id: Uuid,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

    // Parse command line arguments
    let cli = Cli::parse();

    // Set log level based on verbose flag
    if cli.verbose {
        std::env::set_var("RUST_LOG", "debug");
    } else {
        std::env::set_var("RUST_LOG", "info");
    }

    // Create engine
    let engine = create_engine(&cli.config)?;

    // Handle command
    match &cli.command {
        Commands::Run { workflow, params } => {
            run_workflow(&engine, workflow, params).await?;
        }
        Commands::Resume {
            id,
            task,
            trigger_all,
        } => {
            resume_workflow(&engine, *id, task, *trigger_all).await?;
        }
        Commands::Validate { workflow } => {
            validate_workflow(workflow)?;
        }
        Commands::Status { id } => {
            show_status(&engine, *id).await?;
        }
        Commands::List { limit } => {
            list_workflows(&engine, *limit).await?;
        }
        Commands::Cancel { id } => {
            cancel_workflow(&engine, *id).await?;
        }
    }

    Ok(())
}

/// Create an engine based on configuration
fn create_engine(config_path: &Option<PathBuf>) -> Result<Engine> {
    // If no config file is provided, use default local state adapter
    if config_path.is_none() {
        return Ok(Engine::new());
    }

    // Read config file
    let config_path = config_path.as_ref().unwrap();
    let config_content = fs::read_to_string(config_path).context(format!(
        "Failed to read config file: {}",
        config_path.display()
    ))?;

    // Parse config file
    let config: serde_yaml::Value = serde_yaml::from_str(&config_content).context(format!(
        "Failed to parse config file: {}",
        config_path.display()
    ))?;

    // Get state management configuration
    let state_management = config.get("stateManagement").and_then(|v| v.as_mapping());
    if let Some(state_management) = state_management {
        // Get backend type
        let backend = state_management
            .get(serde_yaml::Value::String("backend".to_string()))
            .and_then(|v| v.as_str());

        match backend {
            Some("api") => {
                // Get API configuration
                let api_config = state_management
                    .get(serde_yaml::Value::String("apiConfig".to_string()))
                    .and_then(|v| v.as_mapping());

                if let Some(api_config) = api_config {
                    // Get endpoint
                    let endpoint = api_config
                        .get(serde_yaml::Value::String("endpoint".to_string()))
                        .and_then(|v| v.as_str())
                        .unwrap_or("http://localhost:8080");

                    // Get auth token
                    let auth_token = api_config
                        .get(serde_yaml::Value::String("authToken".to_string()))
                        .and_then(|v| v.as_str())
                        .unwrap_or("");

                    // Create API state adapter
                    let state_adapter = Box::new(ApiStateAdapter::new(
                        endpoint.to_string(),
                        auth_token.to_string(),
                    ));

                    return Ok(Engine::with_state_adapter(state_adapter));
                }
            }
            _ => {
                // Use local state adapter
                return Ok(Engine::new());
            }
        }
    }

    // Default to local state adapter
    Ok(Engine::new())
}

/// Run a workflow
async fn run_workflow(engine: &Engine, workflow_path: &Path, params: &[String]) -> Result<()> {
    // Parse workflow file
    let workflow = utils::parse_workflow_file(workflow_path).context(format!(
        "Failed to parse workflow file: {}",
        workflow_path.display()
    ))?;

    // Parse parameters
    let params = utils::parse_params(params).context("Failed to parse parameters")?;

    // Run workflow
    let workflow_run_id = engine
        .run_workflow(workflow, params)
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
                    "Use 'butterflow resume -i {} --trigger-all' to trigger all tasks",
                    workflow_run_id
                );
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

/// Resume a workflow
async fn resume_workflow(
    engine: &Engine,
    workflow_run_id: Uuid,
    task_ids: &[Uuid],
    trigger_all: bool,
) -> Result<()> {
    info!("Resuming workflow {}...", workflow_run_id);

    if trigger_all {
        // Trigger all awaiting tasks
        engine
            .trigger_all(workflow_run_id)
            .await
            .context("Failed to trigger all tasks")?;

        info!("Triggered all awaiting tasks");
    } else if !task_ids.is_empty() {
        // Trigger specific tasks
        engine
            .resume_workflow(workflow_run_id, task_ids.to_vec())
            .await
            .context("Failed to resume workflow")?;

        info!("Triggered {} tasks", task_ids.len());
    } else {
        error!("No tasks specified to trigger. Use --task or --trigger-all");
        return Ok(());
    }

    // Wait for workflow to complete or pause again
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

/// Validate a workflow file
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
                    StepAction::UseTemplates(uses) => Some(uses),
                    _ => None,
                }
            })
            .flat_map(|u| u.iter())
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

/// Show workflow status
async fn show_status(engine: &Engine, workflow_run_id: Uuid) -> Result<()> {
    // Get workflow run
    let workflow_run = engine
        .get_workflow_run(workflow_run_id)
        .await
        .context("Failed to get workflow run")?;

    // Get tasks
    let tasks = engine
        .get_tasks(workflow_run_id)
        .await
        .context("Failed to get tasks")?;

    // Print workflow info
    info!(
        "Workflow: {} (ID: {})",
        workflow_run
            .workflow
            .nodes
            .first()
            .map(|n| n.name.as_str())
            .unwrap_or("unknown"),
        workflow_run_id
    );
    info!("Status: {:?}", workflow_run.status);
    info!("Started: {}", workflow_run.started_at);

    if let Some(ended_at) = workflow_run.ended_at {
        info!("Completed: {}", ended_at);
        let duration = ended_at.signed_duration_since(workflow_run.started_at);
        info!(
            "Duration: {}",
            utils::format_duration(duration.num_seconds() as u64)
        );
    } else {
        let duration = chrono::Utc::now().signed_duration_since(workflow_run.started_at);
        info!(
            "Duration: {} (running)",
            utils::format_duration(duration.num_seconds() as u64)
        );
    }

    info!("");
    info!("Tasks:");

    // Group tasks by node
    let mut tasks_by_node: HashMap<String, Vec<&Task>> = HashMap::new();
    for task in &tasks {
        tasks_by_node
            .entry(task.node_id.clone())
            .or_default()
            .push(task);
    }

    // Print tasks
    for node in &workflow_run.workflow.nodes {
        let empty_tasks: Vec<&Task> = Vec::new();
        let node_tasks = tasks_by_node.get(&node.id).unwrap_or(&empty_tasks);

        // Find master task for matrix nodes
        let master_task = node_tasks
            .iter()
            .find(|t| t.master_task_id.is_none() && t.matrix_values.is_none());

        if let Some(master_task) = master_task {
            info!(
                "- {} (master) ({}): {:?}",
                node.id, master_task.id, master_task.status
            );

            // Print matrix tasks
            for task in node_tasks.iter().filter(|t| t.master_task_id.is_some()) {
                let matrix_info = task
                    .matrix_values
                    .as_ref()
                    .map(|m| {
                        m.iter()
                            .map(|(k, v)| format!("{}: {}", k, v))
                            .collect::<Vec<_>>()
                            .join(", ")
                    })
                    .unwrap_or_else(|| "unknown".to_string());
                info!(
                    "  - {} ({}, {}): {:?}",
                    node.id, task.id, matrix_info, task.status
                );
            }
        } else if !node_tasks.is_empty() {
            // Print regular task
            let task = node_tasks[0];
            info!("- {} ({}): {:?}", node.id, task.id, task.status);
        } else {
            info!("- {}: No tasks", node.id);
        }
    }

    // Print manual triggers
    let awaiting_tasks: Vec<&Task> = tasks
        .iter()
        .filter(|t| t.status == TaskStatus::AwaitingTrigger)
        .collect();

    if !awaiting_tasks.is_empty() {
        info!("");
        info!("Manual triggers required:");
        for task in awaiting_tasks {
            let node = workflow_run
                .workflow
                .nodes
                .iter()
                .find(|n| n.id == task.node_id)
                .unwrap();
            let matrix_info = task
                .matrix_values
                .as_ref()
                .map(|m| {
                    m.iter()
                        .map(|(k, v)| format!("{}: {}", k, v))
                        .collect::<Vec<_>>()
                        .join(", ")
                })
                .unwrap_or_else(|| "".to_string());
            info!("- {} ({}, {})", task.id, node.id, matrix_info);
        }
    } else {
        info!("");
        info!("Manual triggers required: None");
    }

    Ok(())
}

/// List workflow runs
async fn list_workflows(engine: &Engine, limit: usize) -> Result<()> {
    // Get workflow runs
    let workflow_runs = engine
        .list_workflow_runs(limit)
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

/// Cancel a workflow
async fn cancel_workflow(engine: &Engine, workflow_run_id: Uuid) -> Result<()> {
    info!("Canceling workflow run {}...", workflow_run_id);

    // Cancel workflow
    engine
        .cancel_workflow(workflow_run_id)
        .await
        .context("Failed to cancel workflow")?;

    info!("Workflow run canceled successfully");

    Ok(())
}
