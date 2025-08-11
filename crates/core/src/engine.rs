use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::path::PathBuf;
use std::sync::Arc;
use std::time::Duration;

use crate::registry::Result as RegistryResult;
use chrono::Utc;
use log::{debug, error, info, warn};
use std::path::Path;
use tokio::fs::read_to_string;
use tokio::sync::Mutex;
use tokio::time;
use uuid::Uuid;

use crate::registry::{AuthProvider, RegistryClient, RegistryConfig, ResolvedPackage};
use crate::utils::{self, get_cache_dir};
use butterflow_models::runtime::RuntimeType;
use butterflow_models::step::{StepAction, UseAstGrep, UseCodemod, UseJSAstGrep};
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
use butterflow_scheduler::Scheduler;
use butterflow_state::local_adapter::LocalStateAdapter;
use butterflow_state::StateAdapter;
use codemod_progress_bar::MultiProgressProgressBar;
use codemod_sandbox::{execute_ast_grep_on_globs, execute_ast_grep_on_globs_with_fixes};
use codemod_sandbox::{
    sandbox::{
        engine::{
            language_data::get_extensions_for_language, ExecutionConfig, ExecutionEngine,
            ExecutionStats,
        },
        filesystem::{RealFileSystem, WalkOptions},
        resolvers::OxcResolver,
    },
    utils::project_discovery::find_tsconfig,
};
use std::sync::OnceLock;

pub static GLOBAL_STATS: OnceLock<Mutex<ExecutionStats>> = OnceLock::new();

pub type GitDirtyCheckCallback = Arc<Box<dyn Fn(&Path, bool) + Send + Sync>>;
/// Workflow engine
pub struct Engine {
    /// State adapter for persisting workflow state
    state_adapter: Arc<Mutex<Box<dyn StateAdapter>>>,

    scheduler: Scheduler,
}

/// Represents a codemod dependency chain for cycle detection
#[derive(Debug, Clone)]
struct CodemodDependency {
    /// Source identifier (registry package or local path)
    source: String,
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
        let tasks = self.scheduler.calculate_initial_tasks(workflow_run).await?;

        for task in tasks {
            self.state_adapter.lock().await.save_task(&task).await?;

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
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<Uuid> {
        utils::validate_workflow(&workflow, bundle_path.as_deref().unwrap_or(Path::new("")))?;
        self.validate_codemod_dependencies(&workflow, &[]).await?;

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

        self.state_adapter
            .lock()
            .await
            .save_workflow_run(&workflow_run)
            .await?;

        let engine = self.clone();
        let git_dirty_check_callback = git_dirty_check_callback.clone();
        let progress_bar = progress_bar.cloned();
        tokio::spawn(async move {
            if let Err(e) = engine
                .execute_workflow(
                    workflow_run_id,
                    git_dirty_check_callback,
                    progress_bar.as_ref(),
                )
                .await
            {
                error!("Workflow execution failed: {e}");
            }
        });

        Ok(workflow_run_id)
    }

    /// Resume a workflow run
    pub async fn resume_workflow(
        &self,
        workflow_run_id: Uuid,
        task_ids: Vec<Uuid>,
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        // TODO: Do we need this?
        let _workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;

        let mut triggered = false;
        for task_id in task_ids {
            let task = self.state_adapter.lock().await.get_task(task_id).await?;

            // If the task is awaiting trigger we can trigger it
            // OR if it is in a terminal state, we can trigger it again
            if task.status == TaskStatus::AwaitingTrigger
                || task.status == TaskStatus::Completed
                || task.status == TaskStatus::Failed
            {
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(TaskStatus::Pending)?),
                    },
                );
                let task_diff = TaskDiff { task_id, fields };

                self.state_adapter
                    .lock()
                    .await
                    .apply_task_diff(&task_diff)
                    .await?;

                let engine = self.clone();
                let git_dirty_check_callback = git_dirty_check_callback.clone();
                let progress_bar = progress_bar.unwrap().clone();
                tokio::spawn(async move {
                    if let Err(e) = engine
                        .execute_task(task_id, git_dirty_check_callback, &progress_bar)
                        .await
                    {
                        error!("Task execution failed: {e}");
                    }
                });

                triggered = true;
                info!("Triggered task {} ({})", task_id, task.node_id);
            } else {
                warn!("Task {task_id} is not awaiting trigger");
            }
        }

        if !triggered {
            return Err(Error::Other("No tasks were triggered".to_string()));
        }

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

        self.state_adapter
            .lock()
            .await
            .apply_workflow_run_diff(&workflow_run_diff)
            .await?;

        let engine = self.clone();
        let git_dirty_check_callback = git_dirty_check_callback.clone();
        let progress_bar = progress_bar.cloned();
        tokio::spawn(async move {
            if let Err(e) = engine
                .execute_workflow(
                    workflow_run_id,
                    git_dirty_check_callback,
                    progress_bar.as_ref(),
                )
                .await
            {
                error!("Workflow execution failed: {e}");
            }
        });

        Ok(())
    }

    /// Trigger all awaiting tasks in a workflow run
    pub async fn trigger_all(
        &self,
        workflow_run_id: Uuid,
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        // TODO: Do we need this?
        let _workflow_run = self
            .state_adapter
            .lock()
            .await
            .get_workflow_run(workflow_run_id)
            .await?;

        let tasks = self
            .state_adapter
            .lock()
            .await
            .get_tasks(workflow_run_id)
            .await?;

        let awaiting_tasks: Vec<&Task> = tasks
            .iter()
            .filter(|t| t.status == TaskStatus::AwaitingTrigger)
            .collect();

        if awaiting_tasks.is_empty() {
            // Check if all tasks are complete
            let active_tasks = tasks.iter().any(|t| {
                matches!(
                    t.status,
                    TaskStatus::Pending | TaskStatus::Running | TaskStatus::AwaitingTrigger
                )
            });

            // If no tasks are active, mark the workflow as completed
            if !active_tasks {
                let mut fields = HashMap::new();
                fields.insert(
                    "status".to_string(),
                    FieldDiff {
                        operation: DiffOperation::Update,
                        value: Some(serde_json::to_value(WorkflowStatus::Completed)?),
                    },
                );
                let workflow_run_diff = WorkflowRunDiff {
                    workflow_run_id,
                    fields,
                };

                self.state_adapter
                    .lock()
                    .await
                    .apply_workflow_run_diff(&workflow_run_diff)
                    .await?;

                info!("Workflow run {workflow_run_id} is now complete");
                return Ok(());
            }

            // If we reached here, it means the workflow is still running but no tasks need triggers
            info!("No tasks in workflow run {workflow_run_id} are awaiting triggers");
            return Ok(());
        }

        let mut triggered = false;
        for task in awaiting_tasks {
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

            self.state_adapter
                .lock()
                .await
                .apply_task_diff(&task_diff)
                .await?;

            let engine = self.clone();
            let task_id = task.id;
            let git_dirty_check_callback = git_dirty_check_callback.clone();
            let progress_bar = progress_bar.unwrap().clone();
            tokio::spawn(async move {
                if let Err(e) = engine
                    .execute_task(task_id, git_dirty_check_callback, &progress_bar)
                    .await
                {
                    error!("Task execution failed: {e}");
                }
            });

            triggered = true;
            info!("Triggered task {} ({})", task.id, task.node_id);
        }

        // If no tasks were triggered, it means they're all done or in progress
        // We don't need to error out, just return successfully
        if !triggered {
            return Ok(());
        }

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

        self.state_adapter
            .lock()
            .await
            .apply_workflow_run_diff(&workflow_run_diff)
            .await?;

        let engine = self.clone();
        let git_dirty_check_callback = git_dirty_check_callback.clone();
        let progress_bar = progress_bar.cloned();
        tokio::spawn(async move {
            if let Err(e) = engine
                .execute_workflow(
                    workflow_run_id,
                    git_dirty_check_callback,
                    progress_bar.as_ref(),
                )
                .await
            {
                error!("Workflow execution failed: {e}");
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
                "Workflow run {workflow_run_id} is not running or awaiting triggers"
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

    /// Validate codemod dependencies to prevent infinite recursion cycles
    ///
    /// This method recursively checks all codemod dependencies in a workflow to ensure
    /// there are no circular references that would cause infinite loops during execution.
    ///
    /// Examples of cycles that will be detected:
    /// - Direct cycle: A → A
    /// - Two-step cycle: A → B → A
    /// - Multi-step cycle: A → B → C → A
    ///
    /// # Arguments
    /// * `workflow` - The workflow to validate
    /// * `dependency_chain` - Current chain of codemod dependencies being tracked
    ///
    /// # Returns
    /// * `Ok(())` if no cycles are detected
    /// * `Err(Error::Other)` if a cycle is found, with detailed information about the cycle
    async fn validate_codemod_dependencies(
        &self,
        workflow: &Workflow,
        dependency_chain: &[CodemodDependency],
    ) -> Result<()> {
        for node in &workflow.nodes {
            for step in &node.steps {
                if let StepAction::Codemod(codemod) = &step.action {
                    // Check if this codemod is already in the dependency chain
                    if let Some(cycle_start) =
                        self.find_cycle_in_chain(&codemod.source, dependency_chain)
                    {
                        let chain_str = dependency_chain
                            .iter()
                            .map(|d| d.source.as_str())
                            .collect::<Vec<_>>()
                            .join(" → ");

                        return Err(Error::Other(format!(
                            "Codemod dependency cycle detected!\n\
                            Cycle: {} → {} → {}\n\
                            This would cause infinite recursion during execution.\n\
                            Please review your codemod dependencies to remove the circular reference.",
                            cycle_start,
                            if chain_str.is_empty() { "(root)" } else { &chain_str },
                            codemod.source
                        )));
                    }

                    // Resolve the codemod package to validate its workflow
                    match self
                        .resolve_and_validate_codemod(&codemod.source, dependency_chain)
                        .await
                    {
                        Ok(_) => {}
                        Err(e) => {
                            warn!(
                                "Failed to validate codemod dependency {}: {}",
                                codemod.source, e
                            );
                            // We'll continue validation but log the warning
                            // The actual execution will handle the error appropriately
                        }
                    }
                }
            }
        }
        Ok(())
    }

    /// Find if a codemod source creates a cycle in the dependency chain
    fn find_cycle_in_chain(
        &self,
        source: &str,
        dependency_chain: &[CodemodDependency],
    ) -> Option<String> {
        for dep in dependency_chain {
            if dep.source == source {
                return Some(dep.source.clone());
            }
        }
        None
    }

    /// Resolve a codemod and recursively validate its dependencies
    async fn resolve_and_validate_codemod(
        &self,
        source: &str,
        dependency_chain: &[CodemodDependency],
    ) -> Result<()> {
        // Create a temporary auth provider for validation
        struct NoAuthProvider;
        impl AuthProvider for NoAuthProvider {
            fn get_auth_for_registry(
                &self,
                _registry_url: &str,
            ) -> RegistryResult<Option<crate::registry::RegistryAuth>> {
                Ok(None)
            }
        }

        let registry_config = RegistryConfig {
            default_registry: "https://app.codemod.com".to_string(),
            cache_dir: get_cache_dir()?,
        };

        let registry_client = RegistryClient::new(registry_config, Some(Box::new(NoAuthProvider)));

        // Resolve the package
        let resolved_package = registry_client
            .resolve_package(source, None, false, None)
            .await
            .map_err(|e| Error::Other(format!("Failed to resolve codemod {source}: {e}")))?;

        // Load the codemod's workflow
        let workflow_path = resolved_package.package_dir.join("workflow.yaml");
        if !workflow_path.exists() {
            return Err(Error::Other(format!(
                "Workflow file not found in codemod package: {}",
                workflow_path.display()
            )));
        }

        let workflow_content = std::fs::read_to_string(&workflow_path)
            .map_err(|e| Error::Other(format!("Failed to read workflow file: {e}")))?;

        let codemod_workflow: Workflow = serde_yaml::from_str(&workflow_content)
            .map_err(|e| Error::Other(format!("Failed to parse workflow YAML: {e}")))?;

        // Create new dependency chain including this codemod
        let mut new_chain = dependency_chain.to_vec();
        new_chain.push(CodemodDependency {
            source: source.to_string(),
        });

        // Recursively validate the codemod's workflow dependencies
        Box::pin(self.validate_codemod_dependencies(&codemod_workflow, &new_chain)).await?;

        Ok(())
    }

    /// Execute a workflow
    async fn execute_workflow(
        &self,
        workflow_run_id: Uuid,
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
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

        info!("Starting workflow run {workflow_run_id}");

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
                error!("Failed during matrix task recompilation for run {workflow_run_id}: {e}");
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

                info!("Workflow run {workflow_run_id} is awaiting triggers");

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
                let git_dirty_check_callback = git_dirty_check_callback.clone();
                let progress_bar = progress_bar.unwrap().clone();
                tokio::spawn(async move {
                    if let Err(e) = engine
                        .execute_task(task_id, git_dirty_check_callback, &progress_bar)
                        .await
                    {
                        error!("Task execution failed: {e}");
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
        debug!("Starting matrix task recompilation for run {workflow_run_id}");

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
            debug!("Marking task {task_id} as WontDo");
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
            debug!("Updating master task {master_task_id} status");
            self.update_matrix_master_status(master_task_id).await?;
        }

        debug!("Finished matrix task recompilation for run {workflow_run_id}");
        Ok(())
    }

    /// Execute a task
    async fn execute_task(
        &self,
        task_id: Uuid,
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: &MultiProgressProgressBar,
    ) -> Result<()> {
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
                    git_dirty_check_callback.clone(),
                    Some(progress_bar),
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
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        self.execute_step_action_with_chain(
            runner,
            action,
            step_env,
            node,
            task,
            params,
            state,
            workflow,
            bundle_path,
            &[],
            git_dirty_check_callback,
            progress_bar,
        )
        .await
    }

    /// Execute a specific step action with dependency chain tracking for cycle detection
    #[allow(clippy::too_many_arguments)]
    async fn execute_step_action_with_chain(
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
        dependency_chain: &[CodemodDependency],
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
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
                    Box::pin(self.execute_step_action_with_chain(
                        runner,
                        &template_step.action,
                        &template_step.env,
                        node,
                        task,
                        &combined_params,
                        state,
                        workflow,
                        bundle_path,
                        dependency_chain,
                        git_dirty_check_callback.clone(),
                        progress_bar,
                    ))
                    .await?;
                }
                Ok(())
            }
            StepAction::AstGrep(ast_grep) => {
                self.execute_ast_grep_step_with_dir(
                    node.id.clone(),
                    ast_grep,
                    bundle_path.as_deref(),
                    git_dirty_check_callback,
                    progress_bar,
                )
                .await
            }
            StepAction::JSAstGrep(js_ast_grep) => {
                self.execute_js_ast_grep_step_with_dir(
                    node.id.clone(),
                    js_ast_grep,
                    bundle_path.as_deref(),
                    git_dirty_check_callback,
                    progress_bar,
                )
                .await
            }
            StepAction::Codemod(codemod) => {
                Box::pin(self.execute_codemod_step_with_chain(
                    codemod,
                    step_env,
                    node,
                    task,
                    params,
                    state,
                    bundle_path,
                    dependency_chain,
                    git_dirty_check_callback,
                    progress_bar,
                ))
                .await
            }
        }
    }

    pub async fn execute_ast_grep_step_with_dir(
        &self,
        id: String,
        ast_grep: &UseAstGrep,
        bundle_path: Option<&std::path::Path>,
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        // Use bundle path as working directory, falling back to current directory
        let bundle_path = bundle_path
            .map(|p| p.to_path_buf())
            .or_else(|| std::env::current_dir().ok());
        let working_dir = env::current_dir().ok();

        // Resolve config file path relative to bundle path
        let config_path = if let Some(bundle) = bundle_path {
            bundle.join(&ast_grep.config_file)
        } else {
            std::path::PathBuf::from(&ast_grep.config_file)
        };

        if !config_path.exists() {
            return Err(Error::Other(format!(
                "AST grep config file not found: {}",
                config_path.display()
            )));
        }

        // TODO: Make this configurable
        let should_apply_fixes = true;
        // Execute ast-grep using include/exclude globs with the config file
        let matches = if should_apply_fixes {
            info!(
                "Applying AST grep fixes from config file: {}",
                config_path.display()
            );
            execute_ast_grep_on_globs_with_fixes(
                id,
                ast_grep.include.as_deref(),
                ast_grep.exclude.as_deref(),
                ast_grep.base_path.as_deref(),
                &config_path.to_string_lossy(),
                working_dir.as_deref(),
                ast_grep.allow_dirty.unwrap_or(false),
                git_dirty_check_callback.clone(),
                progress_bar,
            )
            .await
            .map_err(|e| Error::Other(format!("AST grep execution with fixes failed: {e}")))?
        } else {
            execute_ast_grep_on_globs(
                id,
                ast_grep.include.as_deref(),
                ast_grep.exclude.as_deref(),
                ast_grep.base_path.as_deref(),
                &config_path.to_string_lossy(),
                working_dir.as_deref(),
                ast_grep.allow_dirty.unwrap_or(false),
                git_dirty_check_callback.clone(),
                progress_bar,
            )
            .await
            .map_err(|e| Error::Other(format!("AST grep execution failed: {e}")))?
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

    pub async fn execute_js_ast_grep_step_with_dir(
        &self,
        id: String,
        js_ast_grep: &UseJSAstGrep,
        bundle_path: Option<&std::path::Path>,
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        // Use bundle path as working directory, falling back to current directory
        let working_dir = bundle_path
            .map(|p| p.to_path_buf())
            .or_else(|| std::env::current_dir().ok());

        // Resolve JavaScript file path relative to bundle path
        let js_file_path = if let Some(bundle) = bundle_path {
            bundle.join(&js_ast_grep.js_file)
        } else if let Some(wd) = &working_dir {
            wd.join(&js_ast_grep.js_file)
        } else {
            std::path::PathBuf::from(&js_ast_grep.js_file)
        };

        // Resolve base path - similar to ast-grep implementation
        let base_path = if let Some(base) = &js_ast_grep.base_path {
            // Base path is relative to current working directory, not bundle path
            std::env::current_dir()
                .unwrap_or_else(|_| std::path::PathBuf::from("."))
                .join(base)
        } else {
            // If no base path specified, use current working directory
            std::env::current_dir().unwrap_or_else(|_| std::path::PathBuf::from("."))
        };

        if let Some(git_dirty_check_callback) = git_dirty_check_callback {
            git_dirty_check_callback(
                base_path.as_path(),
                js_ast_grep.allow_dirty.unwrap_or(false),
            );
        }

        // Verify the JavaScript file exists
        if !js_file_path.exists() {
            return Err(Error::Other(format!(
                "JavaScript file '{}' does not exist",
                js_file_path.display()
            )));
        }

        // Set up the modular system
        let filesystem = Arc::new(RealFileSystem::new());
        let script_base_dir = js_file_path
            .parent()
            .unwrap_or(Path::new("."))
            .to_path_buf();

        // Find tsconfig.json relative to the bundle path (or working directory as fallback)
        let search_dir = bundle_path
            .or(working_dir.as_deref())
            .unwrap_or(&script_base_dir);
        let tsconfig_path = find_tsconfig(search_dir);

        let resolver = Arc::new(
            OxcResolver::new(script_base_dir.clone(), tsconfig_path)
                .map_err(|e| Error::Other(format!("Failed to create resolver: {e}")))?,
        );

        let mut config = ExecutionConfig::new(filesystem, resolver, script_base_dir);
        let mut walk_options = WalkOptions::default();

        // Apply configuration options from the step definition
        if js_ast_grep.no_gitignore.unwrap_or(false) {
            walk_options.respect_gitignore = false;
        }

        if js_ast_grep.include_hidden.unwrap_or(false) {
            walk_options.include_hidden = true;
        }

        if js_ast_grep.dry_run.unwrap_or(false) {
            config = config.with_dry_run(true);
        }

        if let Some(threads) = js_ast_grep.max_threads {
            if threads > 0 {
                config = config.with_max_threads(threads);
            } else {
                return Err(Error::Other(
                    "max-threads must be greater than 0".to_string(),
                ));
            }
        }

        // Set language first to get default extensions
        let language = if let Some(lang_str) = &js_ast_grep.language {
            let parsed_lang = lang_str
                .parse()
                .map_err(|e| Error::Other(format!("Invalid language '{lang_str}': {e}")))?;
            config = config.with_language(parsed_lang);
            parsed_lang
        } else {
            // Parse TypeScript as default
            let default_lang = "typescript"
                .parse()
                .map_err(|e| Error::Other(format!("Failed to parse default language: {e}")))?;
            config = config.with_language(default_lang);
            default_lang
        };

        // Handle include/exclude patterns with proper glob support
        if let Some(include_patterns) = &js_ast_grep.include {
            config = config.with_include_globs(include_patterns.clone());
        } else {
            // When include is None, use default extensions for the language
            let default_extensions = get_extensions_for_language(language)
                .into_iter()
                .map(|ext| ext.trim_start_matches('.').to_string())
                .collect();
            config = config.with_extensions(default_extensions);
        }

        if let Some(exclude_patterns) = &js_ast_grep.exclude {
            config = config.with_exclude_globs(exclude_patterns.clone());
        }

        config = config.with_walk_options(walk_options);

        // Create and run the execution engine
        let engine = ExecutionEngine::new(config);
        let stats = engine
            .execute_on_directory(&id, &js_file_path, &base_path, progress_bar.cloned())
            .await
            .map_err(|e| Error::Other(format!("JavaScript execution failed: {e}")))?;

        info!("JS AST grep execution completed");
        info!("Modified files: {:?}", stats.files_modified);
        info!("Unmodified files: {:?}", stats.files_unmodified);
        info!("Files with errors: {:?}", stats.files_with_errors);
        // set global stats
        let data = GLOBAL_STATS.get_or_init(|| Mutex::new(ExecutionStats::default()));
        let mut data = data.lock().await;
        *data = stats.clone();

        // TODO: Consider writing execution stats to state or logs
        // Similar to AST grep, this could be extended to:
        // 1. Write execution results to the workflow state for other tasks to use
        // 2. Fail the step if there were errors during execution
        // 3. Write detailed logs for debugging

        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    async fn execute_codemod_step_with_chain(
        &self,
        codemod: &UseCodemod,
        step_env: &Option<HashMap<String, String>>,
        node: &Node,
        task: &Task,
        params: &HashMap<String, String>,
        state: &HashMap<String, serde_json::Value>,
        bundle_path: &Option<PathBuf>,
        dependency_chain: &[CodemodDependency],
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        info!("Executing codemod step: {}", codemod.source);

        // Check for runtime cycles before execution
        if let Some(cycle_start) = self.find_cycle_in_chain(&codemod.source, dependency_chain) {
            let chain_str = dependency_chain
                .iter()
                .map(|d| d.source.as_str())
                .collect::<Vec<_>>()
                .join(" → ");

            return Err(Error::Other(format!(
                "Runtime codemod dependency cycle detected!\n\
                Cycle: {} → {} → {}\n\
                This cycle was not caught during validation, indicating a dynamic dependency.\n\
                Please review your codemod dependencies to remove the circular reference.",
                cycle_start,
                if chain_str.is_empty() {
                    "(root)"
                } else {
                    &chain_str
                },
                codemod.source
            )));
        }

        // For now, we'll create a simple auth provider that returns None
        // The CLI will need to provide proper authentication
        struct NoAuthProvider;
        impl AuthProvider for NoAuthProvider {
            fn get_auth_for_registry(
                &self,
                _registry_url: &str,
            ) -> RegistryResult<Option<crate::registry::RegistryAuth>> {
                Ok(None)
            }
        }

        let registry_config = RegistryConfig {
            default_registry: "https://app.codemod.com".to_string(),
            cache_dir: get_cache_dir()?,
        };

        let registry_client = RegistryClient::new(registry_config, Some(Box::new(NoAuthProvider)));

        // Resolve the package (local path or registry package)
        let resolved_package = registry_client
            .resolve_package(&codemod.source, None, false, None)
            .await
            .map_err(|e| Error::Other(format!("Failed to resolve package: {e}")))?;

        info!(
            "Resolved codemod package: {} -> {}",
            codemod.source,
            resolved_package.package_dir.display()
        );

        // Create new dependency chain including this codemod
        let mut new_chain = dependency_chain.to_vec();
        new_chain.push(CodemodDependency {
            source: codemod.source.clone(),
        });

        // Execute the resolved codemod workflow
        self.run_codemod_workflow_with_chain(
            &resolved_package,
            codemod,
            step_env,
            node,
            task,
            params,
            state,
            bundle_path,
            &new_chain,
            git_dirty_check_callback.clone(),
            progress_bar,
        )
        .await
    }

    #[allow(clippy::too_many_arguments)]
    async fn run_codemod_workflow_with_chain(
        &self,
        resolved_package: &ResolvedPackage,
        codemod: &UseCodemod,
        step_env: &Option<HashMap<String, String>>,
        _node: &Node,
        task: &Task,
        params: &HashMap<String, String>,
        state: &HashMap<String, serde_json::Value>,
        bundle_path: &Option<PathBuf>,
        dependency_chain: &[CodemodDependency],
        git_dirty_check_callback: Option<GitDirtyCheckCallback>,
        progress_bar: Option<&MultiProgressProgressBar>,
    ) -> Result<()> {
        let workflow_path = resolved_package.package_dir.join("workflow.yaml");

        if !workflow_path.exists() {
            return Err(Error::Other(format!(
                "Workflow file not found in codemod package: {}",
                workflow_path.display()
            )));
        }

        // Load the codemod workflow
        let workflow_content = std::fs::read_to_string(&workflow_path)
            .map_err(|e| Error::Other(format!("Failed to read workflow file: {e}")))?;

        let codemod_workflow: Workflow = serde_yaml::from_str(&workflow_content)
            .map_err(|e| Error::Other(format!("Failed to parse workflow YAML: {e}")))?;

        // Prepare parameters for the codemod workflow
        let mut codemod_params = params.clone();

        // Add arguments as parameters if provided
        if let Some(args) = &codemod.args {
            for (i, arg) in args.iter().enumerate() {
                codemod_params.insert(format!("arg_{i}"), arg.clone());

                // Also try to parse key=value format
                if let Some((key, value)) = arg.split_once('=') {
                    codemod_params.insert(key.to_string(), value.to_string());
                }
            }
        }

        // Add environment variables from step configuration
        if let Some(env) = &codemod.env {
            for (key, value) in env {
                codemod_params.insert(format!("env_{key}"), value.clone());
            }
        }

        // Add step-level environment variables
        if let Some(step_env) = step_env {
            for (key, value) in step_env {
                codemod_params.insert(format!("env_{key}"), value.clone());
            }
        }

        // Resolve working directory
        let working_dir = if let Some(wd) = &codemod.working_dir {
            if wd.starts_with("/") {
                PathBuf::from(wd)
            } else if let Some(base) = bundle_path {
                base.join(wd)
            } else {
                std::env::current_dir()
                    .unwrap_or_else(|_| PathBuf::from("."))
                    .join(wd)
            }
        } else {
            // Default to current working directory
            std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
        };

        codemod_params.insert(
            "working_dir".to_string(),
            working_dir.to_string_lossy().to_string(),
        );

        info!(
            "Running codemod workflow: {} with {} parameters",
            resolved_package.spec.name,
            codemod_params.len()
        );

        // Execute the codemod workflow synchronously by running its steps directly
        // This avoids the recursive engine execution cycle
        info!("Executing codemod workflow steps directly");

        // Create a direct runner for executing the codemod steps
        let runner: Box<dyn Runner> = Box::new(DirectRunner::new());

        // Execute each node in the codemod workflow
        for node in &codemod_workflow.nodes {
            for step in &node.steps {
                Box::pin(self.execute_step_action_with_chain(
                    runner.as_ref(),
                    &step.action,
                    &step.env,
                    node,
                    task, // Use the current task context
                    &codemod_params,
                    state,
                    &codemod_workflow,
                    &Some(resolved_package.package_dir.clone()),
                    dependency_chain,
                    git_dirty_check_callback.clone(),
                    progress_bar,
                ))
                .await?;
            }
        }

        info!("Codemod workflow completed successfully");
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
        // Start with a copy of the parent process's environment
        let mut env: HashMap<String, String> = std::env::vars().collect();

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

        // Add task and workflow run IDs
        env.insert(String::from("CODEMOD_TASK_ID"), task.id.to_string());

        env.insert(
            String::from("CODEMOD_WORKFLOW_RUN_ID"),
            task.workflow_run_id.to_string(),
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

        debug!("Command output: {output}");

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
                warn!("Malformed state output line: {line}");
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
            debug!("No child tasks found for master task {master_task_id}, setting status to Completed (or Pending if master just created).");
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
                "All child tasks for master {master_task_id} are terminal. Setting master status to: {final_status:?}"
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
            debug!("Master task {master_task_id} status {new_status:?} remains unchanged.");
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

#[cfg(test)]
mod tests {
    use super::*;
    use butterflow_models::step::{StepAction, UseCodemod};
    use butterflow_models::{Node, Step, Workflow};

    #[tokio::test]
    async fn test_cycle_detection_direct_cycle() {
        let engine = Engine::new();

        // Create a workflow with a codemod that references itself
        let workflow = Workflow {
            version: "1.0.0".to_string(),
            state: None,
            nodes: vec![Node {
                id: "test-node".to_string(),
                name: "Test Node".to_string(),
                description: Some("Test node".to_string()),
                r#type: butterflow_models::node::NodeType::Automatic,
                depends_on: vec![],
                trigger: None,
                strategy: None,
                runtime: None,
                env: HashMap::new(),
                steps: vec![Step {
                    name: "test-step".to_string(),
                    action: StepAction::Codemod(UseCodemod {
                        source: "test-codemod".to_string(),
                        args: None,
                        env: None,
                        working_dir: None,
                    }),
                    env: None,
                }],
            }],
            templates: vec![],
        };

        // Create a dependency chain that includes the same codemod
        let dependency_chain = vec![CodemodDependency {
            source: "test-codemod".to_string(),
        }];

        // Test that cycle detection catches the direct cycle
        let result = engine
            .validate_codemod_dependencies(&workflow, &dependency_chain)
            .await;

        assert!(result.is_err());
        let error = result.unwrap_err();
        match error {
            Error::Other(msg) => {
                assert!(msg.contains("Codemod dependency cycle detected"));
                assert!(msg.contains("test-codemod"));
            }
            _ => panic!("Expected Other error with cycle detection message"),
        }
    }

    #[test]
    fn test_find_cycle_in_chain() {
        let engine = Engine::new();

        let dependency_chain = vec![
            CodemodDependency {
                source: "codemod-a".to_string(),
            },
            CodemodDependency {
                source: "codemod-b".to_string(),
            },
        ];

        // Test finding an existing cycle
        let result = engine.find_cycle_in_chain("codemod-a", &dependency_chain);
        assert_eq!(result, Some("codemod-a".to_string()));

        // Test not finding a cycle with a new codemod
        let result = engine.find_cycle_in_chain("codemod-c", &dependency_chain);
        assert_eq!(result, None);
    }

    #[tokio::test]
    async fn test_runtime_cycle_detection() {
        let engine = Engine::new();

        // Create a dependency chain
        let dependency_chain = vec![CodemodDependency {
            source: "codemod-a".to_string(),
        }];

        // Create a codemod step that would create a cycle
        let codemod = UseCodemod {
            source: "codemod-a".to_string(), // Same as in dependency chain
            args: None,
            env: None,
            working_dir: None,
        };

        // Create minimal test data
        let node = Node {
            id: "test-node".to_string(),
            name: "Test Node".to_string(),
            description: None,
            r#type: butterflow_models::node::NodeType::Automatic,
            depends_on: vec![],
            trigger: None,
            strategy: None,
            runtime: None,
            env: HashMap::new(),
            steps: vec![],
        };

        use butterflow_models::Task;
        use uuid::Uuid;

        let task = Task::new(Uuid::new_v4(), "test-node".to_string(), false);

        let params = HashMap::new();
        let state = HashMap::new();
        let bundle_path = None;

        // Test that runtime cycle detection works
        let result = engine
            .execute_codemod_step_with_chain(
                &codemod,
                &None,
                &node,
                &task,
                &params,
                &state,
                &bundle_path,
                &dependency_chain,
                None,
                None,
            )
            .await;

        assert!(result.is_err());
        let error = result.unwrap_err();
        match error {
            Error::Other(msg) => {
                assert!(msg.contains("Runtime codemod dependency cycle detected"));
                assert!(msg.contains("codemod-a"));
            }
            _ => panic!("Expected Other error with runtime cycle detection message"),
        }
    }
}
