use std::collections::HashMap;
use std::fs::File;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use butterflow_models::step::{StepAction, UseAstGrep};
use butterflow_scheduler::Scheduler;
use butterflow_state::local_adapter::LocalStateAdapter;
use chrono::Utc;
use log::{debug, error, info, warn};
use tokio::fs::read_to_string;
use tokio::sync::Mutex;
use tokio::time;
use uuid::Uuid;

use crate::utils;
use butterflow_models::runtime::RuntimeType;
use butterflow_models::{
    resolve_variables, DiffOperation, Error, FieldDiff, Node, Result, StateDiff, Task, TaskDiff,
    TaskStatus, Workflow, WorkflowRun, WorkflowRunDiff, WorkflowStatus,
};
use butterflow_runners::direct_runner::DirectRunner;
#[cfg(feature = "docker")]
use butterflow_runners::docker_runner::DockerRunner;
#[cfg(feature = "podman")]
use butterflow_runners::podman_runner::PodmanRunner;
use butterflow_runners::Runner;
use butterflow_state::StateAdapter;

/// Workflow engine
pub struct Engine {
    /// State adapter for persisting workflow state
    state_adapter: Arc<Mutex<Box<dyn StateAdapter>>>,

    scheduler: Scheduler,
}

impl Default for Engine {
    fn default() -> Self {
        Self::new()
    }
}

impl Engine {
    /// Create a new engine with a local state adapter
    pub fn new() -> Self {
        let state_adapter: Arc<Mutex<Box<dyn StateAdapter>>> =
            Arc::new(Mutex::new(Box::new(LocalStateAdapter::new())));

        Self {
            state_adapter: Arc::clone(&state_adapter),
            scheduler: Scheduler::new(),
        }
    }

    /// Create initial tasks for all nodes
    async fn create_initial_tasks(&self, workflow_run: &WorkflowRun) -> Result<()> {
        // Use scheduler to calculate initial tasks
        let tasks = self.scheduler.calculate_initial_tasks(workflow_run).await?;

        // Save all tasks to state adapter
        for task in tasks {
            self.state_adapter.lock().await.save_task(&task).await?;

            // Update matrix master status if this is a master task
            if task.is_master {
                self.update_matrix_master_status(task.id).await?;
            }
        }

        Ok(())
    }

    /// Create a new engine with a custom state adapter
    pub fn with_state_adapter(state_adapter: Box<dyn StateAdapter>) -> Self {
        let state_adapter: Arc<Mutex<Box<dyn StateAdapter>>> = Arc::new(Mutex::new(state_adapter));

        Self {
            state_adapter: Arc::clone(&state_adapter),
            scheduler: Scheduler::new(),
        }
    }

    /// Run a workflow
    pub async fn run_workflow(
        &self,
        workflow: Workflow,
        params: HashMap<String, String>,
        bundle_path: Option<PathBuf>,
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
            bundle_path,
            tasks: Vec::new(),
            started_at: Utc::now(),
            ended_at: None,
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
            let current_workflow_run = self
                .state_adapter
                .lock()
                .await
                .get_workflow_run(workflow_run_id)
                .await?;

            // Get all tasks
            let current_tasks = self
                .state_adapter
                .lock()
                .await
                .get_tasks(workflow_run_id)
                .await?;

            // --- Recompile matrix tasks based on current state ---
            // This ensures the task list reflects the latest state before scheduling
            if let Err(e) = self
                .recompile_matrix_tasks(workflow_run_id, &current_workflow_run, &current_tasks)
                .await
            {
                error!(
                    "Failed during matrix task recompilation for run {}: {}",
                    workflow_run_id, e
                );
                // Decide how to handle recompilation errors, e.g., fail the workflow?
                // For now, we log and continue, but this might need refinement.
            }

            // Get potentially updated tasks after recompilation
            let tasks_after_recompilation = self
                .state_adapter
                .lock()
                .await
                .get_tasks(workflow_run_id)
                .await?;
            // --- End of Recompilation ---

            // Check if all tasks are completed or failed
            let all_done = tasks_after_recompilation.iter().all(|t| {
                t.status == TaskStatus::Completed
                    || t.status == TaskStatus::Failed
                    || t.status == TaskStatus::WontDo
            });

            if all_done {
                // Check if any tasks failed
                let any_failed = tasks_after_recompilation
                    .iter()
                    .any(|t| t.status == TaskStatus::Failed);

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

            // Find runnable tasks based on the potentially updated task list
            let runnable_tasks_result = self
                .scheduler
                .find_runnable_tasks(&current_workflow_run, &tasks_after_recompilation)
                .await?;

            let tasks_to_await_trigger = runnable_tasks_result.tasks_to_await_trigger;
            for task_id in tasks_to_await_trigger {
                // Create a task diff to update the status
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(TaskStatus::AwaitingTrigger)?),
                    },
                );
                let task_diff = TaskDiff { task_id, fields };

                // Apply the diff
                self.state_adapter
                    .lock()
                    .await
                    .apply_task_diff(&task_diff)
                    .await?;
            }

            let runnable_tasks = runnable_tasks_result.runnable_tasks;

            // Check if any tasks are awaiting trigger
            let awaiting_trigger = tasks_after_recompilation
                .iter()
                .any(|t| t.status == TaskStatus::AwaitingTrigger);
            let any_running = tasks_after_recompilation
                .iter()
                .any(|t| t.status == TaskStatus::Running);

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
                let task = tasks_after_recompilation
                    .iter()
                    .find(|t| t.id == task_id)
                    .unwrap(); // Should exist as runnable_tasks is derived from this list
                let _node = current_workflow_run // Use the fetched run state
                    .workflow
                    .nodes
                    .iter()
                    .find(|n| n.id == task.node_id)
                    .unwrap(); // Should exist based on how tasks are created

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

    /// Recompile matrix tasks based on the current state.
    /// Creates new tasks for added matrix items and marks tasks for removed items as WontDo.
    async fn recompile_matrix_tasks(
        &self,
        workflow_run_id: Uuid,
        workflow_run: &WorkflowRun,
        tasks: &[Task],
    ) -> Result<()> {
        debug!(
            "Starting matrix task recompilation for run {}",
            workflow_run_id
        );

        let state = self
            .state_adapter
            .lock()
            .await
            .get_state(workflow_run_id)
            .await?;

        // Use scheduler to calculate matrix task changes
        let changes = self
            .scheduler
            .calculate_matrix_task_changes(workflow_run_id, workflow_run, tasks, &state)
            .await?;

        // Create new tasks
        for task in changes.new_tasks {
            debug!("Creating new matrix task for node '{}'", task.node_id);
            self.state_adapter.lock().await.save_task(&task).await?;
        }

        // Mark tasks as WontDo
        for task_id in changes.tasks_to_mark_wont_do {
            debug!("Marking task {} as WontDo", task_id);
            let mut fields = HashMap::new();
            fields.insert(
                "status".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(TaskStatus::WontDo)?),
                },
            );
            let task_diff = TaskDiff { task_id, fields };
            self.state_adapter
                .lock()
                .await
                .apply_task_diff(&task_diff)
                .await?;
        }

        // Update master task status
        for master_task_id in changes.master_tasks_to_update {
            debug!("Updating master task {} status", master_task_id);
            self.update_matrix_master_status(master_task_id).await?;
        }

        debug!(
            "Finished matrix task recompilation for run {}",
            workflow_run_id
        );
        Ok(())
    }

    /// Execute a task
    async fn execute_task(&self, task_id: Uuid) -> Result<()> {
        let task = self.state_adapter.lock().await.get_task(task_id).await?;

        let workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(task.workflow_run_id)
            .await?;

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
            RuntimeType::Docker => {
                #[cfg(feature = "docker")]
                {
                    Box::new(DockerRunner::new())
                }
                #[cfg(not(feature = "docker"))]
                {
                    return Err(Error::UnsupportedRuntime(RuntimeType::Docker));
                }
            }
            RuntimeType::Podman => {
                #[cfg(feature = "podman")]
                {
                    Box::new(PodmanRunner::new())
                }
                #[cfg(not(feature = "podman"))]
                {
                    return Err(Error::UnsupportedRuntime(RuntimeType::Podman));
                }
            }
        };

        // Execute each step in the node
        for step in &node.steps {
            let state = self
                .state_adapter
                .lock()
                .await
                .get_state(workflow_run.id)
                .await?;

            let result = self
                .execute_step_action(
                    runner.as_ref(),
                    &step.action,
                    &step.env,
                    node,
                    &task,
                    &workflow_run.params,
                    &state,
                    &workflow_run.workflow,
                    &workflow_run.bundle_path,
                )
                .await;

            match result {
                Ok(_) => {}
                Err(e) => {
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
                                step.name, e
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
                        task_id, node.id, step.name, e
                    );

                    return Err(e);
                }
            }
        }

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

        // Add matrix values
        if let Some(matrix_values) = &task.matrix_values {
            for (key, value) in matrix_values {
                env.insert(
                    key.clone(),
                    serde_json::to_string(value).unwrap_or(value.to_string()),
                );
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

    /// Execute a specific step action (either RunScript or UseTemplates recursively)
    #[allow(clippy::too_many_arguments)]
    async fn execute_step_action(
        &self,
        runner: &dyn Runner,
        action: &StepAction,
        step_env: &Option<HashMap<String, String>>,
        node: &Node,
        task: &Task,
        params: &HashMap<String, String>,
        state: &HashMap<String, serde_json::Value>,
        workflow: &Workflow,
        bundle_path: &Option<PathBuf>,
    ) -> Result<()> {
        match action {
            StepAction::RunScript(run) => {
                self.execute_run_script_step(
                    runner,
                    run,
                    step_env,
                    node,
                    task,
                    params,
                    state,
                    bundle_path,
                )
                .await
            }
            StepAction::UseTemplate(template_use) => {
                // Find the template using the passed workflow reference
                let template = workflow
                    .templates
                    .iter()
                    .find(|t| t.id == template_use.template)
                    .ok_or_else(|| {
                        Error::Template(format!("Template not found: {}", template_use.template))
                    })?;

                // Combine workflow params with template-specific inputs
                let mut combined_params = params.clone();
                combined_params.extend(template_use.inputs.clone());

                for template_step in &template.steps {
                    Box::pin(self.execute_step_action(
                        runner,
                        &template_step.action,
                        &template_step.env,
                        node,
                        task,
                        &combined_params,
                        state,
                        workflow,
                        bundle_path,
                    ))
                    .await?;
                }
                Ok(())
            }
            StepAction::AstGrep(ast_grep) => {
                self.execute_ast_grep_step_with_dir(ast_grep, None).await
            }
        }
    }

    pub async fn execute_ast_grep_step_with_dir(
        &self,
        ast_grep: &UseAstGrep,
        working_dir: Option<std::path::PathBuf>,
    ) -> Result<()> {
        use codemod_sandbox::{execute_ast_grep_on_globs, execute_ast_grep_on_globs_with_fixes};

        // Get the working directory from parameter, falling back to current directory
        let working_dir = working_dir.or_else(|| std::env::current_dir().ok());
        let working_dir_ref = working_dir.as_deref();

        // Check if the config file contains any fixers to determine if we should apply fixes
        let config_path = if let Some(wd) = working_dir_ref {
            wd.join(&ast_grep.config_file)
        } else {
            std::path::PathBuf::from(&ast_grep.config_file)
        };

        if !config_path.exists() {
            return Err(Error::Other(format!(
                "AST grep config file not found: {}",
                ast_grep.config_file
            )));
        }

        // TODO: Make this configurable
        let should_apply_fixes = true;

        // Execute ast-grep using include/exclude globs with the config file
        let matches = if should_apply_fixes {
            info!("Applying AST grep fixes from config file");
            execute_ast_grep_on_globs_with_fixes(
                ast_grep.include.as_deref(),
                ast_grep.exclude.as_deref(),
                ast_grep.base_path.as_deref(),
                &ast_grep.config_file,
                working_dir_ref,
            )
            .map_err(|e| Error::Other(format!("AST grep execution with fixes failed: {}", e)))?
        } else {
            execute_ast_grep_on_globs(
                ast_grep.include.as_deref(),
                ast_grep.exclude.as_deref(),
                ast_grep.base_path.as_deref(),
                &ast_grep.config_file,
                working_dir_ref,
            )
            .map_err(|e| Error::Other(format!("AST grep execution failed: {}", e)))?
        };

        // Log the results
        if should_apply_fixes {
            info!(
                "AST grep applied fixes and found {} matches across all files",
                matches.len()
            );
        } else {
            info!("AST grep found {} matches across all files", matches.len());
        }

        for ast_match in &matches {
            info!(
                "Match in {}: {}:{}-{}:{} (rule: {})",
                ast_match.file_path,
                ast_match.start_line,
                ast_match.start_column,
                ast_match.end_line,
                ast_match.end_column,
                ast_match.rule_id
            );
            debug!("Match text: {}", ast_match.match_text);
        }

        // TODO: Consider writing match results to state or logs
        // For now, we just log the results. In the future, this could be extended to:
        // 1. Write matches to the workflow state for other tasks to use
        // 2. Write matches to a file for further processing
        // 3. Fail the step if matches are found (for linting use cases)

        Ok(())
    }

    /// Execute a single RunScript step
    #[allow(clippy::too_many_arguments)]
    async fn execute_run_script_step(
        &self,
        runner: &dyn Runner,
        run: &str,
        step_env: &Option<HashMap<String, String>>,
        node: &Node,
        task: &Task,
        params: &HashMap<String, String>,
        state: &HashMap<String, serde_json::Value>,
        bundle_path: &Option<PathBuf>,
    ) -> Result<()> {
        // Prepare environment variables
        let mut env = HashMap::new();

        // Add node environment variables
        for (key, value) in &node.env {
            env.insert(key.clone(), value.clone());
        }

        // Add step environment variables
        if let Some(step_env) = step_env {
            for (key, value) in step_env {
                env.insert(key.clone(), value.clone());
            }
        }

        // Add matrix values
        if let Some(matrix_values) = &task.matrix_values {
            for (key, value) in matrix_values {
                env.insert(
                    key.clone(),
                    serde_json::to_string(value).unwrap_or(value.to_string()),
                );
            }
        }

        // Add temp file var for step outputs
        let temp_dir = std::env::temp_dir();
        let step_outputs_path = temp_dir.join(task.id.to_string());
        File::create(&step_outputs_path)?;

        if let Some(bundle_path) = bundle_path {
            env.insert(
                String::from("CODEMOD_PATH"),
                bundle_path.to_str().unwrap_or("").to_string(),
            );
        }

        env.insert(
            String::from("STATE_OUTPUTS"),
            step_outputs_path
                .canonicalize()?
                .to_str()
                .expect("File path should be valid UTF-8")
                .to_string(),
        );

        // Resolve variables
        let resolved_command = resolve_variables(run, params, state, task.matrix_values.as_ref())?;

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

        let outputs = read_to_string(&step_outputs_path).await?;

        // Clean up the temporary file
        std::fs::remove_file(&step_outputs_path).ok();

        // Update state
        let mut state_diff = HashMap::new();
        for line in outputs.lines() {
            // Check for empty lines
            if line.trim().is_empty() {
                continue;
            }

            // Determine if this is an append operation (@=) or a regular assignment (=)
            let (key, operation, value_str) = if let Some((k, v)) = line.split_once("@=") {
                (k, DiffOperation::Append, v)
            } else if let Some((k, v)) = line.split_once('=') {
                (k, DiffOperation::Update, v)
            } else {
                // Malformed line, log and skip
                warn!("Malformed state output line: {}", line);
                continue;
            };

            // Try to parse value as JSON first, fall back to string if that fails
            let value = match serde_json::from_str::<serde_json::Value>(value_str) {
                Ok(json_value) => json_value,
                Err(_) => {
                    // Not valid JSON, treat as a plain string
                    serde_json::Value::String(value_str.to_string())
                }
            };

            // Add to state diff
            state_diff.insert(
                key.to_string(),
                FieldDiff {
                    operation,
                    value: Some(value),
                },
            );
        }

        self.state_adapter
            .lock()
            .await
            .apply_state_diff(&StateDiff {
                workflow_run_id: task.workflow_run_id,
                fields: state_diff,
            })
            .await?;
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

        // If there are no child tasks (e.g., state was empty or cleared), the master should reflect that.
        if child_tasks.is_empty() {
            debug!("No child tasks found for master task {}, setting status to Completed (or Pending if master just created).", master_task_id);
            let final_status = if master_task.status == TaskStatus::Pending {
                // If the master was just created and has no children yet (empty state)
                // Keep it Pending until state potentially provides children.
                // Or should it be Completed? Let's try Completed.
                TaskStatus::Completed // Or Pending? Needs careful consideration. Let's assume Completed for empty state.
            } else {
                TaskStatus::Completed // If children existed and were removed, it's Completed.
            };

            let mut fields = HashMap::new();
            fields.insert(
                "status".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(final_status)?),
                },
            );
            // Add ended_at if moving to Completed/Failed
            if final_status == TaskStatus::Completed || final_status == TaskStatus::Failed {
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
            self.state_adapter
                .lock()
                .await
                .apply_task_diff(&task_diff)
                .await?;
            return Ok(());
        }

        // Check status based on existing children
        let all_terminal = child_tasks.iter().all(|t| {
            t.status == TaskStatus::Completed
                || t.status == TaskStatus::Failed
                || t.status == TaskStatus::WontDo
        });

        // If all children are in a terminal state, determine the final master status
        if all_terminal {
            let any_failed = child_tasks.iter().any(|t| t.status == TaskStatus::Failed);
            // Consider WontDo: If some are WontDo and others Completed, is master Completed or Failed?
            // Let's say Failed if any child failed, otherwise Completed (even if some are WontDo).
            let final_status = if any_failed {
                TaskStatus::Failed
            } else {
                TaskStatus::Completed
            };

            debug!(
                "All child tasks for master {} are terminal. Setting master status to: {:?}",
                master_task_id, final_status
            );

            let mut fields = HashMap::new();
            fields.insert(
                "status".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(final_status)?),
                },
            );
            fields.insert(
                "ended_at".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(Utc::now())?),
                },
            );
            let task_diff = TaskDiff {
                task_id: master_task_id,
                fields,
            };
            self.state_adapter
                .lock()
                .await
                .apply_task_diff(&task_diff)
                .await?;
            return Ok(());
        }

        // If not all children are terminal, determine intermediate status
        let any_failed = child_tasks.iter().any(|t| t.status == TaskStatus::Failed);
        let any_running = child_tasks.iter().any(|t| t.status == TaskStatus::Running);
        let any_awaiting = child_tasks
            .iter()
            .any(|t| t.status == TaskStatus::AwaitingTrigger);
        let any_pending = child_tasks.iter().any(|t| t.status == TaskStatus::Pending); // Added check for pending

        // Create a task diff to update the status
        let mut fields = HashMap::new();

        // Determine the new status based on priority: Failed > Awaiting > Running > Pending
        let new_status = if any_failed {
            TaskStatus::Failed
        } else if any_awaiting {
            TaskStatus::AwaitingTrigger
        } else if any_running {
            TaskStatus::Running
        } else if any_pending {
            TaskStatus::Pending // If some are pending and others completed/wontdo, master is still pending/running implicitly
        } else {
            // This case should ideally be covered by the 'all_terminal' check above,
            // but as a fallback, keep the current status.
            master_task.status
        };

        // Only apply diff if the status is actually changing
        if new_status != master_task.status {
            debug!(
                "Updating master task {} status from {:?} to {:?}",
                master_task_id, master_task.status, new_status
            );
            fields.insert(
                "status".to_string(),
                FieldDiff {
                    operation: DiffOperation::Update,
                    value: Some(serde_json::to_value(new_status)?),
                },
            );

            // Clear ended_at if moving away from a terminal state (e.g., Failed -> Running if retried, although retry isn't implemented here)
            // Or add ended_at if moving *to* Failed from a non-terminal state
            if new_status == TaskStatus::Failed
                && !matches!(
                    master_task.status,
                    TaskStatus::Completed | TaskStatus::Failed | TaskStatus::WontDo
                )
            {
                fields.insert(
                    "ended_at".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update, // Add or update ended_at
                        value: Some(serde_json::to_value(Utc::now())?),
                    },
                );
            } else if matches!(
                master_task.status,
                TaskStatus::Completed | TaskStatus::Failed | TaskStatus::WontDo
            ) && new_status != TaskStatus::Failed
            {
                // If moving from terminal (except Failed) to non-terminal, clear ended_at? Or is this impossible?
                // For now, only add ended_at when entering Failed/Completed.
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
        } else {
            debug!(
                "Master task {} status {:?} remains unchanged.",
                master_task_id, new_status
            );
        }

        Ok(())
    }
}

impl Clone for Engine {
    fn clone(&self) -> Self {
        Self {
            state_adapter: Arc::clone(&self.state_adapter),
            scheduler: Scheduler::new(),
        }
    }
}
