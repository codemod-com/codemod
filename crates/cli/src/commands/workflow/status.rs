use anyhow::{Context, Result};
use butterflow_core::engine::Engine;
use butterflow_core::utils;
use butterflow_models::{Task, TaskStatus};
use clap::Args;
use log::info;
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Args, Debug)]
pub struct Command {
    /// Workflow run ID
    #[arg(short, long)]
    id: Uuid,
}

/// Show workflow status
pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    // Get workflow run
    let workflow_run = engine
        .get_workflow_run(args.id)
        .await
        .context("Failed to get workflow run")?;

    // Get tasks
    let tasks = engine
        .get_tasks(args.id)
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
        args.id
    );
    info!("Status: {:?}", workflow_run.status);
    info!("Started: {}", workflow_run.started_at);

    if let Some(ended_at) = workflow_run.ended_at {
        info!("Completed: {ended_at}");
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
                            .map(|(k, v)| format!("{k}: {v}"))
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
                        .map(|(k, v)| format!("{k}: {v}"))
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
