use std::collections::HashMap;
use std::sync::Arc;
use std::time::Duration;

use chrono::Utc;
use log::{debug, error, info, warn};
use tokio::sync::Mutex;
use tokio::time;
use uuid::Uuid;

use crate::utils;
use butterflow_models::node::NodeType;
use butterflow_models::runtime::RuntimeType;
use butterflow_models::step::Step;
use butterflow_models::trigger::TriggerType;
use butterflow_models::{
    resolve_variables, DiffOperation, Error, FieldDiff, Node, Result, Task, TaskDiff, TaskStatus,
    Workflow, WorkflowRun, WorkflowRunDiff, WorkflowStatus,
};
use butterflow_runners::{DirectRunner, DockerRunner, PodmanRunner, Runner};
use butterflow_state::{LocalStateAdapter, StateAdapter};

/// Workflow engine
pub struct Engine {
    /// State adapter for persisting workflow state
    state_adapter: Arc<Mutex<Box<dyn StateAdapter>>>,
}

impl Engine {
    /// Create a new engine with a local state adapter
    pub fn new() -> Self {
        Self {
            state_adapter: Arc::new(Mutex::new(Box::new(LocalStateAdapter::new()))),
        }
    }

    /// Create a new engine with a custom state adapter
    pub fn with_state_adapter(state_adapter: Box<dyn StateAdapter>) -> Self {
        Self {
            state_adapter: Arc::new(Mutex::new(state_adapter)),
        }
    }

    /// Run a workflow
    pub async fn run_workflow(
        &self,
        workflow: Workflow,
        params: HashMap<String, String>,
    ) -> Result<Uuid> {
        // Validate the workflow
        utils::validate_workflow(&workflow)?;

        // Create a new workflow run
        let workflow_run_id = Uuid::new_v4();
        let workflow_run = WorkflowRun {
            id: workflow_run_id,
            workflow: workflow.clone(),
            status: WorkflowStatus::Pending,
            params: params.clone(),
            tasks: Vec::new(),
            started_at: Utc::now(),
            ended_at: None,
            state: HashMap::new(),
        };

        // Save the initial workflow run state
        self.state_adapter
            .lock()
            .await
            .save_workflow_run(&workflow_run)
            .await?;

        // Start the workflow execution
        let engine = self.clone();
        tokio::spawn(async move {
            if let Err(e) = engine.execute_workflow(workflow_run_id).await {
                error!("Workflow execution failed: {}", e);
            }
        });

        Ok(workflow_run_id)
    }

    /// Resume a workflow run
    pub async fn resume_workflow(&self, workflow_run_id: Uuid, task_ids: Vec<Uuid>) -> Result<()> {
        // TODO: Do we need this?
        // Get the workflow run
        let _workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;

        // Trigger the specified tasks
        let mut triggered = false;
        for task_id in task_ids {
            // Get the task directly from the state adapter
            let task = self.state_adapter.lock().await.get_task(task_id).await?;

            if task.status == TaskStatus::AwaitingTrigger {
                // Create a task diff to update the status
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(TaskStatus::Pending)?),
                    },
                );
                let task_diff = TaskDiff { task_id, fields };

                // Apply the diff
                self.state_adapter
                    .lock()
                    .await
                    .apply_task_diff(&task_diff)
                    .await?;

                // Execute the task immediately
                let engine = self.clone();
                tokio::spawn(async move {
                    if let Err(e) = engine.execute_task(task_id).await {
                        error!("Task execution failed: {}", e);
                    }
                });

                triggered = true;
                info!("Triggered task {} ({})", task_id, task.node_id);
            } else {
                warn!("Task {} is not awaiting trigger", task_id);
            }
        }

        if !triggered {
            return Err(Error::Other("No tasks were triggered".to_string()));
        }

        // Create a workflow run diff to update the status
        let mut fields = HashMap::new();
        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(WorkflowStatus::Running)?),
            },
        );
        let workflow_run_diff = WorkflowRunDiff {
            workflow_run_id,
            fields,
        };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_workflow_run_diff(&workflow_run_diff)
            .await?;

        // Resume workflow execution
        let engine = self.clone();
        tokio::spawn(async move {
            if let Err(e) = engine.execute_workflow(workflow_run_id).await {
                error!("Workflow execution failed: {}", e);
            }
        });

        Ok(())
    }

    /// Trigger all awaiting tasks in a workflow run
    pub async fn trigger_all(&self, workflow_run_id: Uuid) -> Result<()> {
        // TODO: Do we need this?
        // Get the workflow run
        let _workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;

        // Get all tasks
        let tasks = self
            .state_adapter
            .lock()
            .await
            .get_tasks(workflow_run_id)
            .await?;

        // Find all tasks that are awaiting trigger
        let awaiting_tasks: Vec<&Task> = tasks
            .iter()
            .filter(|t| t.status == TaskStatus::AwaitingTrigger)
            .collect();

        if awaiting_tasks.is_empty() {
            return Err(Error::Other(format!(
                "No tasks in workflow run {} are awaiting triggers",
                workflow_run_id
            )));
        }

        // Trigger all awaiting tasks
        let mut triggered = false;
        for task in awaiting_tasks {
            // Create a task diff to update the status
            let mut fields = HashMap::new();
            fields.insert(
                "status".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(TaskStatus::Pending)?),
                },
            );
            let task_diff = TaskDiff {
                task_id: task.id,
                fields,
            };

            // Apply the diff
            self.state_adapter
                .lock()
                .await
                .apply_task_diff(&task_diff)
                .await?;

            // Execute the task immediately
            let engine = self.clone();
            let task_id = task.id;
            tokio::spawn(async move {
                if let Err(e) = engine.execute_task(task_id).await {
                    error!("Task execution failed: {}", e);
                }
            });

            triggered = true;
            info!("Triggered task {} ({})", task.id, task.node_id);
        }

        if !triggered {
            return Err(Error::Other("No tasks were awaiting trigger".to_string()));
        }

        // Create a workflow run diff to update the status
        let mut fields = HashMap::new();
        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(WorkflowStatus::Running)?),
            },
        );
        let workflow_run_diff = WorkflowRunDiff {
            workflow_run_id,
            fields,
        };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_workflow_run_diff(&workflow_run_diff)
            .await?;

        // Resume workflow execution
        let engine = self.clone();
        tokio::spawn(async move {
            if let Err(e) = engine.execute_workflow(workflow_run_id).await {
                error!("Workflow execution failed: {}", e);
            }
        });

        Ok(())
    }

    /// Cancel a workflow run
    pub async fn cancel_workflow(&self, workflow_run_id: Uuid) -> Result<()> {
        // Get the workflow run
        let workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;

        // Check if the workflow is running or awaiting triggers
        if workflow_run.status != WorkflowStatus::Running
            && workflow_run.status != WorkflowStatus::AwaitingTrigger
        {
            return Err(Error::Other(format!(
                "Workflow run {} is not running or awaiting triggers",
                workflow_run_id
            )));
        }

        // Get all tasks
        let tasks = self
            .state_adapter
            .lock()
            .await
            .get_tasks(workflow_run_id)
            .await?;

        // Cancel all running tasks
        for task in tasks.iter().filter(|t| t.status == TaskStatus::Running) {
            // Create a task diff to update the status
            let mut fields = HashMap::new();
            fields.insert(
                "status".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(TaskStatus::Failed)?),
                },
            );
            fields.insert(
                "error".to_string(),
                FieldDiff {
                    operation: DiffOperation::Add,
                    value: Some(serde_json::to_value("Canceled by user")?),
                },
            );
            let task_diff = TaskDiff {
                task_id: task.id,
                fields,
            };

            // Apply the diff
            self.state_adapter
                .lock()
                .await
                .apply_task_diff(&task_diff)
                .await?;

            info!("Canceled task {} ({})", task.id, task.node_id);
        }

        // Create a workflow run diff to update the status
        let mut fields = HashMap::new();
        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(WorkflowStatus::Canceled)?),
            },
        );
        fields.insert(
            "ended_at".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(Utc::now())?),
            },
        );
        let workflow_run_diff = WorkflowRunDiff {
            workflow_run_id,
            fields,
        };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_workflow_run_diff(&workflow_run_diff)
            .await?;

        Ok(())
    }

    /// Get workflow run status
    pub async fn get_workflow_status(&self, workflow_run_id: Uuid) -> Result<WorkflowStatus> {
        let workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;
        Ok(workflow_run.status)
    }

    /// Get workflow run
    pub async fn get_workflow_run(&self, workflow_run_id: Uuid) -> Result<WorkflowRun> {
        self.state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await
    }

    /// Get tasks for a workflow run
    pub async fn get_tasks(&self, workflow_run_id: Uuid) -> Result<Vec<Task>> {
        self.state_adapter
            .lock()
            .await
            .get_tasks(workflow_run_id)
            .await
    }

    /// List workflow runs
    pub async fn list_workflow_runs(&self, limit: usize) -> Result<Vec<WorkflowRun>> {
        self.state_adapter
            .lock()
            .await
            .list_workflow_runs(limit)
            .await
    }

    /// Execute a workflow
    async fn execute_workflow(&self, workflow_run_id: Uuid) -> Result<()> {
        // Get the workflow run
        let workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;

        // Create a workflow run diff to update the status
        let mut fields = HashMap::new();
        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(WorkflowStatus::Running)?),
            },
        );
        let workflow_run_diff = WorkflowRunDiff {
            workflow_run_id,
            fields,
        };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_workflow_run_diff(&workflow_run_diff)
            .await?;

        info!("Starting workflow run {}", workflow_run_id);

        // Create tasks for all nodes if they don't exist yet
        let existing_tasks = self
            .state_adapter
            .lock()
            .await
            .get_tasks(workflow_run_id)
            .await?;
        if existing_tasks.is_empty() {
            self.create_initial_tasks(&workflow_run).await?;
        }

        // Main execution loop
        loop {
            // Get the current workflow run state
            let workflow_run = self
                .state_adapter
                .lock()
                .await
                .get_workflow_run(workflow_run_id)
                .await?;

            // Get all tasks
            let tasks = self
                .state_adapter
                .lock()
                .await
                .get_tasks(workflow_run_id)
                .await?;

            // Check if all tasks are completed or failed
            let all_done = tasks.iter().all(|t| {
                t.status == TaskStatus::Completed
                    || t.status == TaskStatus::Failed
                    || t.status == TaskStatus::WontDo
            });

            if all_done {
                // Check if any tasks failed
                let any_failed = tasks.iter().any(|t| t.status == TaskStatus::Failed);

                // Create a workflow run diff to update the status
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(if any_failed {
                            WorkflowStatus::Failed
                        } else {
                            WorkflowStatus::Completed
                        })?),
                    },
                );
                fields.insert(
                    "ended_at".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(Utc::now())?),
                    },
                );
                let workflow_run_diff = WorkflowRunDiff {
                    workflow_run_id,
                    fields,
                };

                // Apply the diff
                self.state_adapter
                    .lock()
                    .await
                    .apply_workflow_run_diff(&workflow_run_diff)
                    .await?;

                info!(
                    "Workflow run {} {}",
                    workflow_run_id,
                    if any_failed { "failed" } else { "completed" }
                );

                break;
            }

            // Find runnable tasks
            let runnable_tasks = self.find_runnable_tasks(&workflow_run, &tasks).await?;

            // Check if any tasks are awaiting trigger
            let awaiting_trigger = tasks
                .iter()
                .any(|t| t.status == TaskStatus::AwaitingTrigger);
            let any_running = tasks.iter().any(|t| t.status == TaskStatus::Running);

            // If there are tasks awaiting trigger and no runnable tasks and no running tasks,
            // then we need to pause the workflow and wait for manual triggers
            if awaiting_trigger && runnable_tasks.is_empty() && !any_running {
                // Create a workflow run diff to update the status
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(WorkflowStatus::AwaitingTrigger)?),
                    },
                );
                let workflow_run_diff = WorkflowRunDiff {
                    workflow_run_id,
                    fields,
                };

                // Apply the diff
                self.state_adapter
                    .lock()
                    .await
                    .apply_workflow_run_diff(&workflow_run_diff)
                    .await?;

                info!("Workflow run {} is awaiting triggers", workflow_run_id);

                // Exit the execution loop, will be resumed when triggers are received
                break;
            }

            // Execute runnable tasks
            for task_id in runnable_tasks {
                let task = tasks.iter().find(|t| t.id == task_id).unwrap();
                // TODO: Do we need this variable?
                let _node = workflow_run
                    .workflow
                    .nodes
                    .iter()
                    .find(|n| n.id == task.node_id)
                    .unwrap();

                // Start task execution
                let engine = self.clone();
                let task_id = task.id;
                tokio::spawn(async move {
                    if let Err(e) = engine.execute_task(task_id).await {
                        error!("Task execution failed: {}", e);
                    }
                });
            }

            // Wait a bit before checking again
            time::sleep(Duration::from_secs(1)).await;
        }

        Ok(())
    }

    /// Create initial tasks for all nodes
    async fn create_initial_tasks(&self, workflow_run: &WorkflowRun) -> Result<()> {
        for node in &workflow_run.workflow.nodes {
            // Check if the node has a matrix strategy
            if let Some(strategy) = &node.strategy {
                // Create a master task for the matrix
                let master_task = Task::new_matrix_master(workflow_run.id, node.id.clone());
                self.state_adapter
                    .lock()
                    .await
                    .save_task(&master_task)
                    .await?;

                // If the matrix uses values, create tasks for each value
                if let Some(values) = &strategy.values {
                    for value in values {
                        let task = Task::new_matrix(
                            workflow_run.id,
                            node.id.clone(),
                            master_task.id,
                            value.clone(),
                        );
                        self.state_adapter.lock().await.save_task(&task).await?;
                    }
                }
                // If the matrix uses state, we'll create tasks when the state is available
            } else {
                // Create a single task for the node
                let task = Task::new(workflow_run.id, node.id.clone());
                self.state_adapter.lock().await.save_task(&task).await?;
            }
        }

        Ok(())
    }

    /// Find tasks that can be executed
    async fn find_runnable_tasks(
        &self,
        workflow_run: &WorkflowRun,
        tasks: &[Task],
    ) -> Result<Vec<Uuid>> {
        let mut runnable_tasks = Vec::new();

        for task in tasks {
            // Only consider pending tasks
            if task.status != TaskStatus::Pending {
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
                // Create a task diff to update the status
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(TaskStatus::AwaitingTrigger)?),
                    },
                );
                let task_diff = TaskDiff {
                    task_id: task.id,
                    fields,
                };

                // Apply the diff
                self.state_adapter
                    .lock()
                    .await
                    .apply_task_diff(&task_diff)
                    .await?;
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

        Ok(runnable_tasks)
    }

    /// Execute a task
    async fn execute_task(&self, task_id: Uuid) -> Result<()> {
        // Get the task
        let task = self.state_adapter.lock().await.get_task(task_id).await?;

        // Get the workflow run
        let workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(task.workflow_run_id)
            .await?;

        // Get the node for this task
        let node = workflow_run
            .workflow
            .nodes
            .iter()
            .find(|n| n.id == task.node_id)
            .ok_or_else(|| Error::NodeNotFound(task.node_id.clone()))?;

        // Create a task diff to update the status
        let mut fields = HashMap::new();
        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(TaskStatus::Running)?),
            },
        );
        fields.insert(
            "started_at".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(Utc::now())?),
            },
        );
        let task_diff = TaskDiff { task_id, fields };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_task_diff(&task_diff)
            .await?;

        info!("Executing task {} ({})", task_id, node.id);

        // Create a runner for this task
        let runner: Box<dyn Runner> = match node
            .runtime
            .as_ref()
            .map(|r| r.r#type)
            .unwrap_or(RuntimeType::Direct)
        {
            RuntimeType::Direct => Box::new(DirectRunner::new()),
            RuntimeType::Docker => Box::new(DockerRunner::new()),
            RuntimeType::Podman => Box::new(PodmanRunner::new()),
        };

        // Execute each step in the node
        for step in &node.steps {
            // Check if the step uses a template
            if let Some(uses) = &step.uses {
                for template_use in uses {
                    // Find the template
                    let template = workflow_run
                        .workflow
                        .templates
                        .iter()
                        .find(|t| t.id == template_use.template)
                        .ok_or_else(|| {
                            Error::Template(format!(
                                "Template not found: {}",
                                template_use.template
                            ))
                        })?;

                    // Execute the template steps
                    for template_step in &template.steps {
                        // Execute the step
                        let result = self
                            .execute_step(
                                runner.as_ref(),
                                template_step,
                                &node,
                                &task,
                                &workflow_run,
                            )
                            .await;

                        if let Err(e) = result {
                            // Create a task diff to update the status
                            let mut fields = HashMap::new();
                            fields.insert(
                                "status".to_string(),
                                FieldDiff {
                                    operation: DiffOperation::Update,
                                    value: Some(serde_json::to_value(TaskStatus::Failed)?),
                                },
                            );
                            fields.insert(
                                "ended_at".to_string(),
                                FieldDiff {
                                    operation: DiffOperation::Update,
                                    value: Some(serde_json::to_value(Utc::now())?),
                                },
                            );
                            fields.insert(
                                "error".to_string(),
                                FieldDiff {
                                    operation: DiffOperation::Add,
                                    value: Some(serde_json::to_value(format!(
                                        "Step {} failed: {}",
                                        template_step.id, e
                                    ))?),
                                },
                            );
                            let task_diff = TaskDiff { task_id, fields };

                            // Apply the diff
                            self.state_adapter
                                .lock()
                                .await
                                .apply_task_diff(&task_diff)
                                .await?;

                            error!(
                                "Task {} ({}) step {} failed: {}",
                                task_id, node.id, template_step.id, e
                            );

                            return Err(e);
                        }
                    }
                }
            }
            // TODO: Do we need commands?
            else if let Some(_commands) = &step.commands {
                // Execute the step
                let result = self
                    .execute_step(runner.as_ref(), step, &node, &task, &workflow_run)
                    .await;

                if let Err(e) = result {
                    // Create a task diff to update the status
                    let mut fields = HashMap::new();
                    fields.insert(
                        "status".to_string(),
                        FieldDiff {
                            operation: DiffOperation::Update,
                            value: Some(serde_json::to_value(TaskStatus::Failed)?),
                        },
                    );
                    fields.insert(
                        "ended_at".to_string(),
                        FieldDiff {
                            operation: DiffOperation::Update,
                            value: Some(serde_json::to_value(Utc::now())?),
                        },
                    );
                    fields.insert(
                        "error".to_string(),
                        FieldDiff {
                            operation: DiffOperation::Add,
                            value: Some(serde_json::to_value(format!(
                                "Step {} failed: {}",
                                step.id, e
                            ))?),
                        },
                    );
                    let task_diff = TaskDiff { task_id, fields };

                    // Apply the diff
                    self.state_adapter
                        .lock()
                        .await
                        .apply_task_diff(&task_diff)
                        .await?;

                    error!(
                        "Task {} ({}) step {} failed: {}",
                        task_id, node.id, step.id, e
                    );

                    return Err(e);
                }
            }
        }

        // Create a task diff to update the status
        let mut fields = HashMap::new();
        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(TaskStatus::Completed)?),
            },
        );
        fields.insert(
            "ended_at".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(Utc::now())?),
            },
        );
        let task_diff = TaskDiff { task_id, fields };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_task_diff(&task_diff)
            .await?;

        info!("Task {} ({}) completed", task_id, node.id);

        // If this is a matrix task, update the master task status
        if let Some(master_task_id) = task.master_task_id {
            self.update_matrix_master_status(master_task_id).await?;
        }

        Ok(())
    }

    /// Execute a step
    async fn execute_step(
        &self,
        runner: &dyn Runner,
        step: &Step,
        node: &Node,
        task: &Task,
        workflow_run: &WorkflowRun,
    ) -> Result<()> {
        // Get the commands for this step
        let commands = match &step.commands {
            Some(commands) => commands,
            None => return Ok(()), // No commands to execute
        };

        // Prepare environment variables
        let mut env = HashMap::new();

        // Add workflow parameters
        for (key, value) in &workflow_run.params {
            env.insert(format!("PARAM_{}", key.to_uppercase()), value.clone());
        }

        // Add node environment variables
        for (key, value) in &node.env {
            env.insert(key.clone(), value.clone());
        }

        // Add step environment variables
        if let Some(step_env) = &step.env {
            for (key, value) in step_env {
                env.insert(key.clone(), value.clone());
            }
        }

        // Add matrix values
        if let Some(matrix_values) = &task.matrix_values {
            for (key, value) in matrix_values {
                env.insert(key.clone(), value.clone());
            }
        }

        // Execute each command
        for command in commands {
            // Resolve variables in the command
            let resolved_command = resolve_variables(
                command,
                &workflow_run.params,
                &env,
                &workflow_run.state,
                &HashMap::new(), // TODO: Implement task outputs
                task.matrix_values.as_ref(),
            )?;

            // Execute the command
            let output = runner.run_command(&resolved_command, &env).await?;

            // Get the current task
            let mut current_task = self.state_adapter.lock().await.get_task(task.id).await?;

            // Append to the logs
            current_task.logs.push(output.clone());

            // Save the updated task
            self.state_adapter
                .lock()
                .await
                .save_task(&current_task)
                .await?;

            debug!("Command output: {}", output);
        }

        Ok(())
    }

    /// Update the status of a matrix master task
    async fn update_matrix_master_status(&self, master_task_id: Uuid) -> Result<()> {
        // Get the master task
        let master_task = self
            .state_adapter
            .lock()
            .await
            .get_task(master_task_id)
            .await?;

        // Get all child tasks
        let tasks = self
            .state_adapter
            .lock()
            .await
            .get_tasks(master_task.workflow_run_id)
            .await?;
        let child_tasks: Vec<&Task> = tasks
            .iter()
            .filter(|t| t.master_task_id == Some(master_task_id))
            .collect();

        // Check if all child tasks are completed or failed
        let all_completed = child_tasks
            .iter()
            .all(|t| t.status == TaskStatus::Completed);

        let any_failed = child_tasks.iter().any(|t| t.status == TaskStatus::Failed);

        let any_running = child_tasks.iter().any(|t| t.status == TaskStatus::Running);

        let any_awaiting = child_tasks
            .iter()
            .any(|t| t.status == TaskStatus::AwaitingTrigger);

        // Create a task diff to update the status
        let mut fields = HashMap::new();

        // Determine the new status
        let new_status = if any_failed {
            TaskStatus::Failed
        } else if all_completed {
            TaskStatus::Completed
        } else if any_awaiting {
            TaskStatus::AwaitingTrigger
        } else if any_running {
            TaskStatus::Running
        } else {
            master_task.status // Keep the current status if none of the above
        };

        fields.insert(
            "status".to_string(),
            FieldDiff {
                operation: DiffOperation::Update,
                value: Some(serde_json::to_value(new_status)?),
            },
        );

        // Add ended_at if the task is completed or failed
        if any_failed || all_completed {
            fields.insert(
                "ended_at".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(Utc::now())?),
                },
            );
        }

        let task_diff = TaskDiff {
            task_id: master_task_id,
            fields,
        };

        // Apply the diff
        self.state_adapter
            .lock()
            .await
            .apply_task_diff(&task_diff)
            .await?;

        Ok(())
    }
}

impl Clone for Engine {
    fn clone(&self) -> Self {
        Self {
            state_adapter: Arc::clone(&self.state_adapter),
        }
    }
}
