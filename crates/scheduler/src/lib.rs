use std::collections::{HashMap, HashSet};

use log::{debug, warn};
use uuid::Uuid;

use butterflow_models::node::NodeType;
use butterflow_models::trigger::TriggerType;
use butterflow_models::{Error, Result, Strategy, StrategyType, Task, TaskStatus, WorkflowRun};

/// Struct to hold the result of matrix task recompilation calculations
pub struct MatrixTaskChanges {
    pub new_tasks: Vec<Task>,
    pub tasks_to_mark_wont_do: Vec<Uuid>,
    pub master_tasks_to_update: Vec<Uuid>,
}

pub struct RunnableTaskChanges {
    pub tasks_to_await_trigger: Vec<Uuid>,
    pub runnable_tasks: Vec<Uuid>,
}

pub struct Scheduler {}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}

impl Scheduler {
    pub fn new() -> Self {
        Self {}
    }

    /// Calculate initial tasks for all nodes in a workflow
    pub async fn calculate_initial_tasks(&self, workflow_run: &WorkflowRun) -> Result<Vec<Task>> {
        let mut tasks = Vec::new();

        for node in &workflow_run.workflow.nodes {
            // Check if the node has a matrix strategy
            if let Some(Strategy {
                r#type: StrategyType::Matrix,
                values,
                from_state: _,
            }) = &node.strategy
            {
                // Create a master task for the matrix
                let master_task = Task::new(workflow_run.id, node.id.clone(), true);
                tasks.push(master_task.clone());

                // If the matrix uses values, create tasks for each value
                if let Some(values) = values {
                    for value in values {
                        // Create a task for each matrix value
                        let task = Task::new_matrix(
                            workflow_run.id,
                            node.id.clone(),
                            master_task.id,
                            value.clone(),
                        );
                        tasks.push(task);
                    }
                }
                // If the matrix uses state, tasks will be created during recompilation
            } else {
                // Create a single task for the node
                let task = Task::new(workflow_run.id, node.id.clone(), false);
                tasks.push(task);
            }
        }

        Ok(tasks)
    }

    /// Calculate changes needed for matrix tasks based on current state
    pub async fn calculate_matrix_task_changes(
        &self,
        workflow_run_id: Uuid,
        workflow_run: &WorkflowRun,
        tasks: &[Task],
        state: &HashMap<String, serde_json::Value>,
    ) -> Result<MatrixTaskChanges> {
        let mut new_tasks = Vec::new();
        let mut tasks_to_mark_wont_do = Vec::new();
        let mut master_tasks_to_update = Vec::new();

        for node in &workflow_run.workflow.nodes {
            if let Some(Strategy {
                r#type: StrategyType::Matrix,
                from_state: Some(state_key), // Only process matrix nodes using from_state
                ..
            }) = &node.strategy
            {
                debug!(
                    "Calculating changes for matrix node '{}' using state key '{}'",
                    node.id, state_key
                );

                // Find the master task for this node
                let master_task_id =
                    match tasks.iter().find(|t| t.node_id == node.id && t.is_master) {
                        Some(master) => master.id,
                        None => {
                            // Master task doesn't exist yet, create it
                            let new_master_task = Task::new(workflow_run_id, node.id.clone(), true);
                            new_tasks.push(new_master_task.clone());
                            master_tasks_to_update.push(new_master_task.id);
                            new_master_task.id
                        }
                    };

                // Add master task to update list if not already there
                if !master_tasks_to_update.contains(&master_task_id) {
                    master_tasks_to_update.push(master_task_id);
                }

                // Get the current value from the state
                let state_value = state.get(state_key);

                // --- Calculate Values for Current State Items ---
                let mut current_item_values = Vec::new();

                match state_value {
                    Some(serde_json::Value::Array(items)) => {
                        for item in items {
                            current_item_values.push(item.clone());
                        }
                        debug!("Found {} items in state array '{}'", items.len(), state_key);
                    }
                    Some(serde_json::Value::Object(_obj)) => {
                        // Object mapping not fully supported yet
                        warn!("Matrix from_state for object key '{}' is not yet fully supported, skipping.", state_key);
                        continue; // Skip this node
                    }
                    _ => {
                        // State key not found or not an array/object
                        debug!("State key '{}' for matrix node '{}' is missing or not an array/object.", state_key, node.id);
                    }
                }

                // --- Compare with Existing Tasks ---
                // Store existing tasks keyed by their matrix_values for comparison
                let existing_child_tasks_by_value: HashMap<serde_json::Value, &Task> = tasks
                    .iter()
                    .filter(|t| {
                        t.master_task_id == Some(master_task_id) && t.matrix_values.is_some()
                    })
                    .filter_map(|t| {
                        serde_json::to_value(t.matrix_values.as_ref().unwrap())
                            .ok()
                            .map(|v| (v, t))
                    })
                    .collect();

                let existing_child_values: HashSet<serde_json::Value> =
                    existing_child_tasks_by_value.keys().cloned().collect();

                debug!(
                    "Found {} existing child tasks for node '{}'",
                    existing_child_tasks_by_value.len(),
                    node.id
                );

                // --- Identify Tasks to Create ---
                let current_item_values_set: HashSet<_> =
                    current_item_values.iter().cloned().collect();

                for item_value in current_item_values {
                    if !existing_child_values.contains(&item_value) {
                        // Task for this value doesn't exist, need to create it
                        let matrix_data = match item_value.as_object() {
                            Some(obj) => obj
                                .iter()
                                .filter_map(|(k, v)| v.as_str().map(|s| (k.clone(), s.to_string())))
                                .collect::<HashMap<_, _>>(),
                            None => {
                                warn!(
                                    "Matrix item for node '{}' is not a JSON object, skipping: {:?}",
                                    node.id,
                                    item_value
                                );
                                continue; // Skip this item
                            }
                        };

                        let new_task = Task::new_matrix(
                            workflow_run_id,
                            node.id.clone(),
                            master_task_id,
                            matrix_data,
                        );
                        debug!(
                            "Need to create new task for node '{}', value: {:?}",
                            node.id, item_value
                        );
                        new_tasks.push(new_task);
                    }
                }

                // --- Identify Tasks to Mark as WontDo ---
                for (task_value, task) in &existing_child_tasks_by_value {
                    if !current_item_values_set.contains(task_value) {
                        // This task's value is no longer in the current state
                        // Mark as WontDo only if it's not already in a terminal state
                        if !matches!(
                            task.status,
                            TaskStatus::Completed | TaskStatus::Failed | TaskStatus::WontDo
                        ) {
                            debug!(
                                "Need to mark task {} (value {:?}) for node '{}' as WontDo",
                                task.id, task_value, node.id
                            );
                            tasks_to_mark_wont_do.push(task.id);
                        }
                    }
                }
            }
        }

        Ok(MatrixTaskChanges {
            new_tasks,
            tasks_to_mark_wont_do,
            master_tasks_to_update,
        })
    }

    /// Find tasks that can be executed
    pub async fn find_runnable_tasks(
        &self,
        workflow_run: &WorkflowRun,
        tasks: &[Task],
    ) -> Result<RunnableTaskChanges> {
        let mut runnable_tasks = Vec::new();
        let mut tasks_to_await_trigger = Vec::new();

        for task in tasks {
            // Only consider pending tasks and non-master tasks
            if task.status != TaskStatus::Pending || task.is_master {
                continue;
            }

            // Get the node for this task
            let node = workflow_run
                .workflow
                .nodes
                .iter()
                .find(|n| n.id == task.node_id)
                .ok_or_else(|| Error::NodeNotFound(task.node_id.clone()))?;

            // Check if the node has a manual trigger
            if node.r#type == NodeType::Manual
                || node
                    .trigger
                    .as_ref()
                    .map(|t| t.r#type == TriggerType::Manual)
                    .unwrap_or(false)
            {
                tasks_to_await_trigger.push(task.id);
                continue;
            }

            // Check if all dependencies are satisfied
            let mut dependencies_satisfied = true;
            for dep_id in &node.depends_on {
                // Find all tasks for this dependency
                let dep_tasks: Vec<&Task> = tasks.iter().filter(|t| t.node_id == *dep_id).collect();

                // If there are no tasks for this dependency, it's not satisfied
                if dep_tasks.is_empty() {
                    dependencies_satisfied = false;
                    break;
                }

                // Check if all tasks for this dependency are completed
                let all_completed = dep_tasks.iter().all(|t| t.status == TaskStatus::Completed);

                if !all_completed {
                    dependencies_satisfied = false;
                    break;
                }
            }

            if dependencies_satisfied {
                runnable_tasks.push(task.id);
            }
        }

        Ok(RunnableTaskChanges {
            tasks_to_await_trigger,
            runnable_tasks,
        })
    }
}
