use std::collections::HashMap;

use async_trait::async_trait;
use serde_json::Value;
use uuid::Uuid;

use butterflow_models::{Error, Result, StateDiff, Task, TaskDiff, WorkflowRun, WorkflowRunDiff};

use crate::StateAdapter;

/// API state adapter (sends state updates to an API)
pub struct ApiStateAdapter {
    #[allow(dead_code)]
    /// API endpoint
    endpoint: String,

    #[allow(dead_code)]
    /// Authentication token
    auth_token: String,
}

impl ApiStateAdapter {
    /// Create a new API state adapter
    pub fn new(endpoint: String, auth_token: String) -> Self {
        Self {
            endpoint,
            auth_token,
        }
    }
}

#[async_trait]
impl StateAdapter for ApiStateAdapter {
    async fn save_workflow_run(&mut self, _workflow_run: &WorkflowRun) -> Result<()> {
        // TODO: Implement API call to save workflow run
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn apply_workflow_run_diff(&mut self, _diff: &WorkflowRunDiff) -> Result<()> {
        // TODO: Implement API call to apply workflow run diff
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn get_workflow_run(&self, _workflow_run_id: Uuid) -> Result<WorkflowRun> {
        // TODO: Implement API call to get workflow run
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn list_workflow_runs(&self, _limit: usize) -> Result<Vec<WorkflowRun>> {
        // TODO: Implement API call to list workflow runs
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn save_task(&mut self, _task: &Task) -> Result<()> {
        // TODO: Implement API call to save task
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn apply_task_diff(&mut self, _diff: &TaskDiff) -> Result<()> {
        // TODO: Implement API call to apply task diff
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn get_task(&self, _task_id: Uuid) -> Result<Task> {
        // TODO: Implement API call to get task
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn get_tasks(&self, _workflow_run_id: Uuid) -> Result<Vec<Task>> {
        // TODO: Implement API call to get tasks
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn update_state(
        &mut self,
        _workflow_run_id: Uuid,
        _state: HashMap<String, Value>,
    ) -> Result<()> {
        // TODO: Implement API call to update state
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn apply_state_diff(&mut self, _diff: &StateDiff) -> Result<()> {
        // TODO: Implement API call to apply state diff
        Err(Error::Other("Not implemented".to_string()))
    }

    async fn get_state(&self, _workflow_run_id: Uuid) -> Result<HashMap<String, Value>> {
        // TODO: Implement API call to get state
        Err(Error::Other("Not implemented".to_string()))
    }
}
