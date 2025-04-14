use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use async_trait::async_trait;
use serde_json::Value;
use uuid::Uuid;

use butterflow_models::{
    DiffOperation, Error, Result, StateDiff, Task, TaskDiff, WorkflowRun, WorkflowRunDiff,
};

/// State adapter trait for persisting workflow state
#[async_trait]
pub trait StateAdapter: Send + Sync {
    /// Save a workflow run
    async fn save_workflow_run(&mut self, workflow_run: &WorkflowRun) -> Result<()>;

    /// Apply a diff to a workflow run
    async fn apply_workflow_run_diff(&mut self, diff: &WorkflowRunDiff) -> Result<()>;

    /// Get a workflow run
    async fn get_workflow_run(&self, workflow_run_id: Uuid) -> Result<WorkflowRun>;

    /// List workflow runs
    async fn list_workflow_runs(&self, limit: usize) -> Result<Vec<WorkflowRun>>;

    /// Save a task
    async fn save_task(&mut self, task: &Task) -> Result<()>;

    /// Apply a diff to a task
    async fn apply_task_diff(&mut self, diff: &TaskDiff) -> Result<()>;

    /// Get a task
    async fn get_task(&self, task_id: Uuid) -> Result<Task>;

    /// Get all tasks for a workflow run
    async fn get_tasks(&self, workflow_run_id: Uuid) -> Result<Vec<Task>>;

    /// Update workflow state
    async fn update_state(
        &mut self,
        workflow_run_id: Uuid,
        state: HashMap<String, Value>,
    ) -> Result<()>;

    /// Apply a diff to workflow state
    async fn apply_state_diff(&mut self, diff: &StateDiff) -> Result<()>;

    /// Get workflow state
    async fn get_state(&self, workflow_run_id: Uuid) -> Result<HashMap<String, Value>>;
}

/// Local state adapter (stores state in local files)
pub struct LocalStateAdapter {
    /// Base directory for storing state
    base_dir: PathBuf,

    /// Workflow runs
    workflow_runs: HashMap<Uuid, WorkflowRun>,

    /// Tasks
    tasks: HashMap<Uuid, Task>,
}

impl Default for LocalStateAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl LocalStateAdapter {
    /// Create a new local state adapter
    pub fn new() -> Self {
        // Get the data directory
        let data_dir = dirs::data_dir()
            .unwrap_or_else(|| PathBuf::from("."))
            .join("butterflow");

        // Create the data directory if it doesn't exist
        fs::create_dir_all(&data_dir).unwrap_or_else(|e| {
            eprintln!("Failed to create data directory: {}", e);
        });

        Self {
            base_dir: data_dir,
            workflow_runs: HashMap::new(),
            tasks: HashMap::new(),
        }
    }

    /// Create a new local state adapter with a custom base directory
    pub fn with_base_dir<P: AsRef<Path>>(base_dir: P) -> Self {
        // Create the base directory if it doesn't exist
        fs::create_dir_all(&base_dir).unwrap_or_else(|e| {
            eprintln!("Failed to create base directory: {}", e);
        });

        Self {
            base_dir: base_dir.as_ref().to_path_buf(),
            workflow_runs: HashMap::new(),
            tasks: HashMap::new(),
        }
    }

    /// Get the path to a workflow run file
    fn workflow_run_path(&self, workflow_run_id: Uuid) -> PathBuf {
        self.base_dir
            .join("workflow_runs")
            .join(format!("{}.json", workflow_run_id))
    }

    /// Get the path to a task file
    fn task_path(&self, task_id: Uuid) -> PathBuf {
        self.base_dir
            .join("tasks")
            .join(format!("{}.json", task_id))
    }

    /// Get the path to a workflow state file
    fn state_path(&self, workflow_run_id: Uuid) -> PathBuf {
        self.base_dir
            .join("state")
            .join(format!("{}.json", workflow_run_id))
    }

    /// Load a workflow run from disk
    fn load_workflow_run(&self, workflow_run_id: Uuid) -> Result<WorkflowRun> {
        let path = self.workflow_run_path(workflow_run_id);

        // Check if the file exists
        if !path.exists() {
            return Err(Error::Other(format!(
                "Workflow run {} not found",
                workflow_run_id
            )));
        }

        // Read the file
        let content = fs::read_to_string(path)?;

        // Parse the JSON
        let workflow_run = serde_json::from_str(&content)?;

        Ok(workflow_run)
    }

    /// Load a task from disk
    fn load_task(&self, task_id: Uuid) -> Result<Task> {
        let path = self.task_path(task_id);

        // Check if the file exists
        if !path.exists() {
            return Err(Error::Other(format!("Task {} not found", task_id)));
        }

        // Read the file
        let content = fs::read_to_string(path)?;

        // Parse the JSON
        let task = serde_json::from_str(&content)?;

        Ok(task)
    }

    /// Load workflow state from disk
    fn load_state(&self, workflow_run_id: Uuid) -> Result<HashMap<String, Value>> {
        let path = self.state_path(workflow_run_id);

        // Check if the file exists
        if !path.exists() {
            return Ok(HashMap::new());
        }

        // Read the file
        let content = fs::read_to_string(path)?;

        // Parse the JSON
        let state = serde_json::from_str(&content)?;

        Ok(state)
    }
}

#[async_trait]
impl StateAdapter for LocalStateAdapter {
    async fn save_workflow_run(&mut self, workflow_run: &WorkflowRun) -> Result<()> {
        // Create the workflow_runs directory if it doesn't exist
        let dir = self.base_dir.join("workflow_runs");
        fs::create_dir_all(&dir)?;

        // Serialize the workflow run
        let json = serde_json::to_string_pretty(workflow_run)?;

        // Write to disk
        let path = self.workflow_run_path(workflow_run.id);
        fs::write(path, json)?;

        // Update in-memory cache
        self.workflow_runs
            .insert(workflow_run.id, workflow_run.clone());

        Ok(())
    }

    async fn apply_workflow_run_diff(&mut self, diff: &WorkflowRunDiff) -> Result<()> {
        // Get the workflow run
        let mut workflow_run = self.get_workflow_run(diff.workflow_run_id).await?;

        // Apply the diff
        for (field, field_diff) in &diff.fields {
            match field_diff.operation {
                DiffOperation::Add | DiffOperation::Update => {
                    if let Some(value) = &field_diff.value {
                        // Convert the workflow run to a JSON value
                        let mut workflow_run_value = serde_json::to_value(&workflow_run)?;

                        // Update the field
                        if let serde_json::Value::Object(obj) = &mut workflow_run_value {
                            obj.insert(field.clone(), value.clone());
                        }

                        // Convert back to a workflow run
                        workflow_run = serde_json::from_value(workflow_run_value)?;
                    }
                }
                DiffOperation::Remove => {
                    // Convert the workflow run to a JSON value
                    let mut workflow_run_value = serde_json::to_value(&workflow_run)?;

                    // Remove the field
                    if let serde_json::Value::Object(obj) = &mut workflow_run_value {
                        obj.remove(field);
                    }

                    // Convert back to a workflow run
                    workflow_run = serde_json::from_value(workflow_run_value)?;
                }
            }
        }

        // Save the updated workflow run
        self.save_workflow_run(&workflow_run).await
    }

    async fn get_workflow_run(&self, workflow_run_id: Uuid) -> Result<WorkflowRun> {
        // Check if the workflow run is in the cache
        if let Some(workflow_run) = self.workflow_runs.get(&workflow_run_id) {
            return Ok(workflow_run.clone());
        }

        // Load from disk
        self.load_workflow_run(workflow_run_id)
    }

    async fn list_workflow_runs(&self, limit: usize) -> Result<Vec<WorkflowRun>> {
        // Create the workflow_runs directory if it doesn't exist
        let dir = self.base_dir.join("workflow_runs");
        fs::create_dir_all(&dir)?;

        // List all files in the directory
        let mut entries = fs::read_dir(dir)?
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry
                    .path()
                    .extension()
                    .map(|ext| ext == "json")
                    .unwrap_or(false)
            })
            .collect::<Vec<_>>();

        // Sort by modification time (newest first)
        entries.sort_by(|a, b| {
            let a_time = a
                .metadata()
                .and_then(|m| m.modified())
                .unwrap_or_else(|_| std::time::SystemTime::now());
            let b_time = b
                .metadata()
                .and_then(|m| m.modified())
                .unwrap_or_else(|_| std::time::SystemTime::now());
            b_time.cmp(&a_time)
        });

        // Load the workflow runs
        let mut workflow_runs = Vec::new();
        for entry in entries.iter().take(limit) {
            let path = entry.path();
            let file_name = path.file_stem().unwrap().to_string_lossy();
            if let Ok(workflow_run_id) = Uuid::parse_str(&file_name) {
                if let Ok(workflow_run) = self.load_workflow_run(workflow_run_id) {
                    workflow_runs.push(workflow_run);
                }
            }
        }

        Ok(workflow_runs)
    }

    async fn save_task(&mut self, task: &Task) -> Result<()> {
        // Create the tasks directory if it doesn't exist
        let dir = self.base_dir.join("tasks");
        fs::create_dir_all(&dir)?;

        // Serialize the task
        let json = serde_json::to_string_pretty(task)?;

        // Write to disk
        let path = self.task_path(task.id);
        fs::write(path, json)?;

        // Update in-memory cache
        self.tasks.insert(task.id, task.clone());

        Ok(())
    }

    async fn get_task(&self, task_id: Uuid) -> Result<Task> {
        // Check if the task is in the cache
        if let Some(task) = self.tasks.get(&task_id) {
            return Ok(task.clone());
        }

        // Load from disk
        self.load_task(task_id)
    }

    async fn get_tasks(&self, workflow_run_id: Uuid) -> Result<Vec<Task>> {
        // Create the tasks directory if it doesn't exist
        let dir = self.base_dir.join("tasks");
        fs::create_dir_all(&dir)?;

        // List all files in the directory
        let entries = fs::read_dir(dir)?
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry
                    .path()
                    .extension()
                    .map(|ext| ext == "json")
                    .unwrap_or(false)
            })
            .collect::<Vec<_>>();

        // Load the tasks
        let mut tasks = Vec::new();
        for entry in entries {
            let path = entry.path();
            let file_name = path.file_stem().unwrap().to_string_lossy();
            if let Ok(task_id) = Uuid::parse_str(&file_name) {
                if let Ok(task) = self.load_task(task_id) {
                    if task.workflow_run_id == workflow_run_id {
                        tasks.push(task);
                    }
                }
            }
        }

        Ok(tasks)
    }

    async fn update_state(
        &mut self,
        workflow_run_id: Uuid,
        state: HashMap<String, Value>,
    ) -> Result<()> {
        // Create the state directory if it doesn't exist
        let dir = self.base_dir.join("state");
        fs::create_dir_all(&dir)?;

        // Serialize the state
        let json = serde_json::to_string_pretty(&state)?;

        // Write to disk
        let path = self.state_path(workflow_run_id);
        fs::write(path, json)?;

        Ok(())
    }

    async fn apply_task_diff(&mut self, diff: &TaskDiff) -> Result<()> {
        // Get the task
        let mut task = self.get_task(diff.task_id).await?;

        // Apply the diff
        for (field, field_diff) in &diff.fields {
            match field_diff.operation {
                DiffOperation::Add | DiffOperation::Update => {
                    if let Some(value) = &field_diff.value {
                        // Convert the task to a JSON value
                        let mut task_value = serde_json::to_value(&task)?;

                        // Update the field
                        if let serde_json::Value::Object(obj) = &mut task_value {
                            obj.insert(field.clone(), value.clone());
                        }

                        // Convert back to a task
                        task = serde_json::from_value(task_value)?;
                    }
                }
                DiffOperation::Remove => {
                    // Convert the task to a JSON value
                    let mut task_value = serde_json::to_value(&task)?;

                    // Remove the field
                    if let serde_json::Value::Object(obj) = &mut task_value {
                        obj.remove(field);
                    }

                    // Convert back to a task
                    task = serde_json::from_value(task_value)?;
                }
            }
        }

        // Save the updated task
        self.save_task(&task).await
    }

    async fn apply_state_diff(&mut self, diff: &StateDiff) -> Result<()> {
        // Get the current state
        let mut state = self.get_state(diff.workflow_run_id).await?;

        // Apply the diff
        for (field, field_diff) in &diff.fields {
            match field_diff.operation {
                DiffOperation::Add | DiffOperation::Update => {
                    if let Some(value) = &field_diff.value {
                        state.insert(field.clone(), value.clone());
                    }
                }
                DiffOperation::Remove => {
                    state.remove(field);
                }
            }
        }

        // Save the updated state
        self.update_state(diff.workflow_run_id, state).await
    }

    async fn get_state(&self, workflow_run_id: Uuid) -> Result<HashMap<String, Value>> {
        self.load_state(workflow_run_id)
    }
}

/// API state adapter (sends state updates to an API)
pub struct ApiStateAdapter {
    /// API endpoint
    endpoint: String,

    /// Authentication token
    auth_token: String,

    /// Local state adapter for fallback
    local_adapter: LocalStateAdapter,
}

impl ApiStateAdapter {
    /// Create a new API state adapter
    pub fn new(endpoint: String, auth_token: String) -> Self {
        Self {
            endpoint,
            auth_token,
            local_adapter: LocalStateAdapter::new(),
        }
    }
}

#[async_trait]
impl StateAdapter for ApiStateAdapter {
    async fn save_workflow_run(&mut self, workflow_run: &WorkflowRun) -> Result<()> {
        // Save to local adapter as fallback
        self.local_adapter.save_workflow_run(workflow_run).await?;

        // Send to API
        let client = reqwest::Client::new();
        let res = client
            .post(format!("{}/workflow_runs", self.endpoint))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .json(workflow_run)
            .send()
            .await;

        match res {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    eprintln!("API error: {} - {}", status, text);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        Ok(())
    }

    async fn get_workflow_run(&self, workflow_run_id: Uuid) -> Result<WorkflowRun> {
        // Try to get from API
        let client = reqwest::Client::new();
        let res = client
            .get(format!(
                "{}/workflow_runs/{}",
                self.endpoint, workflow_run_id
            ))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .send()
            .await;

        match res {
            Ok(response) => {
                if response.status().is_success() {
                    let workflow_run = response.json::<WorkflowRun>().await.map_err(|e| {
                        Error::Other(format!("Failed to parse API response: {}", e))
                    })?;
                    return Ok(workflow_run);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        // Fall back to local adapter
        self.local_adapter.get_workflow_run(workflow_run_id).await
    }

    async fn list_workflow_runs(&self, limit: usize) -> Result<Vec<WorkflowRun>> {
        // Try to get from API
        let client = reqwest::Client::new();
        let res = client
            .get(format!("{}/workflow_runs?limit={}", self.endpoint, limit))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .send()
            .await;

        match res {
            Ok(response) => {
                if response.status().is_success() {
                    let workflow_runs = response.json::<Vec<WorkflowRun>>().await.map_err(|e| {
                        Error::Other(format!("Failed to parse API response: {}", e))
                    })?;
                    return Ok(workflow_runs);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        // Fall back to local adapter
        self.local_adapter.list_workflow_runs(limit).await
    }

    async fn save_task(&mut self, task: &Task) -> Result<()> {
        // Save to local adapter as fallback
        self.local_adapter.save_task(task).await?;

        // Send to API
        let client = reqwest::Client::new();
        let res = client
            .post(format!("{}/tasks", self.endpoint))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .json(task)
            .send()
            .await;

        match res {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    eprintln!("API error: {} - {}", status, text);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        Ok(())
    }

    async fn get_task(&self, task_id: Uuid) -> Result<Task> {
        // Try to get from API
        let client = reqwest::Client::new();
        let res = client
            .get(format!("{}/tasks/{}", self.endpoint, task_id))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .send()
            .await;

        match res {
            Ok(response) => {
                if response.status().is_success() {
                    let task = response.json::<Task>().await.map_err(|e| {
                        Error::Other(format!("Failed to parse API response: {}", e))
                    })?;
                    return Ok(task);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        // Fall back to local adapter
        self.local_adapter.get_task(task_id).await
    }

    async fn get_tasks(&self, workflow_run_id: Uuid) -> Result<Vec<Task>> {
        // Try to get from API
        let client = reqwest::Client::new();
        let res = client
            .get(format!(
                "{}/workflow_runs/{}/tasks",
                self.endpoint, workflow_run_id
            ))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .send()
            .await;

        match res {
            Ok(response) => {
                if response.status().is_success() {
                    let tasks = response.json::<Vec<Task>>().await.map_err(|e| {
                        Error::Other(format!("Failed to parse API response: {}", e))
                    })?;
                    return Ok(tasks);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        // Fall back to local adapter
        self.local_adapter.get_tasks(workflow_run_id).await
    }

    async fn update_state(
        &mut self,
        workflow_run_id: Uuid,
        state: HashMap<String, Value>,
    ) -> Result<()> {
        // Save to local adapter as fallback
        self.local_adapter
            .update_state(workflow_run_id, state.clone())
            .await?;

        // Send to API
        let client = reqwest::Client::new();
        let res = client
            .post(format!(
                "{}/workflow_runs/{}/state",
                self.endpoint, workflow_run_id
            ))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .json(&state)
            .send()
            .await;

        match res {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    eprintln!("API error: {} - {}", status, text);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        Ok(())
    }

    async fn apply_workflow_run_diff(&mut self, diff: &WorkflowRunDiff) -> Result<()> {
        // Apply to local adapter as fallback
        self.local_adapter.apply_workflow_run_diff(diff).await?;

        // Send to API
        let client = reqwest::Client::new();
        let res = client
            .patch(format!(
                "{}/workflow_runs/{}/diff",
                self.endpoint, diff.workflow_run_id
            ))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .json(diff)
            .send()
            .await;

        match res {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    eprintln!("API error: {} - {}", status, text);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        Ok(())
    }

    async fn apply_task_diff(&mut self, diff: &TaskDiff) -> Result<()> {
        // Apply to local adapter as fallback
        self.local_adapter.apply_task_diff(diff).await?;

        // Send to API
        let client = reqwest::Client::new();
        let res = client
            .patch(format!("{}/tasks/{}/diff", self.endpoint, diff.task_id))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .json(diff)
            .send()
            .await;

        match res {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    eprintln!("API error: {} - {}", status, text);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        Ok(())
    }

    async fn apply_state_diff(&mut self, diff: &StateDiff) -> Result<()> {
        // Apply to local adapter as fallback
        self.local_adapter.apply_state_diff(diff).await?;

        // Send to API
        let client = reqwest::Client::new();
        let res = client
            .patch(format!(
                "{}/workflow_runs/{}/state/diff",
                self.endpoint, diff.workflow_run_id
            ))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .json(diff)
            .send()
            .await;

        match res {
            Ok(response) => {
                if !response.status().is_success() {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    eprintln!("API error: {} - {}", status, text);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        Ok(())
    }

    async fn get_state(&self, workflow_run_id: Uuid) -> Result<HashMap<String, Value>> {
        // Try to get from API
        let client = reqwest::Client::new();
        let res = client
            .get(format!(
                "{}/workflow_runs/{}/state",
                self.endpoint, workflow_run_id
            ))
            .header("Authorization", format!("Bearer {}", self.auth_token))
            .send()
            .await;

        match res {
            Ok(response) => {
                if response.status().is_success() {
                    let state = response
                        .json::<HashMap<String, Value>>()
                        .await
                        .map_err(|e| {
                            Error::Other(format!("Failed to parse API response: {}", e))
                        })?;
                    return Ok(state);
                }
            }
            Err(e) => {
                eprintln!("API error: {}", e);
            }
        }

        // Fall back to local adapter
        self.local_adapter.get_state(workflow_run_id).await
    }
}

// State adapters are already public
