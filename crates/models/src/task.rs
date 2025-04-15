use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

/// Status of a task
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TaskStatus {
    /// Task hasn't started execution yet
    Pending,

    /// Task is currently being executed
    Running,

    /// Task has completed successfully
    Completed,

    /// Task execution failed with an error
    Failed,

    /// Task is waiting for a manual trigger
    AwaitingTrigger,

    /// Task is blocked by dependencies
    Blocked,

    /// Task will not be executed
    WontDo,
}

/// Represents a task (runtime instance of a node)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    /// Unique identifier for the task
    pub id: Uuid,

    /// ID of the workflow run this task belongs to
    pub workflow_run_id: Uuid,

    /// ID of the node this task is an instance of
    pub node_id: String,

    /// Current status of the task
    pub status: TaskStatus,

    /// For matrix tasks, the master task ID
    #[serde(default)]
    pub master_task_id: Option<Uuid>,

    /// For matrix tasks, the matrix values
    #[serde(default)]
    pub matrix_values: Option<HashMap<String, String>>,

    /// Start time of the task
    #[serde(default)]
    pub started_at: Option<DateTime<Utc>>,

    /// End time of the task (if completed or failed)
    #[serde(default)]
    pub ended_at: Option<DateTime<Utc>>,

    /// Error message (if failed)
    #[serde(default)]
    pub error: Option<String>,

    /// Outputs from the task
    #[serde(default)]
    pub outputs: HashMap<String, serde_json::Value>,

    /// Logs from the task
    #[serde(default)]
    pub logs: Vec<String>,
}

impl Task {
    /// Create a new task
    pub fn new(workflow_run_id: Uuid, node_id: String) -> Self {
        Self {
            id: Uuid::new_v4(),
            workflow_run_id,
            node_id,
            status: TaskStatus::Pending,
            master_task_id: None,
            matrix_values: None,
            started_at: None,
            ended_at: None,
            error: None,
            outputs: HashMap::new(),
            logs: Vec::new(),
        }
    }

    /// Create a new matrix task
    pub fn new_matrix(
        workflow_run_id: Uuid,
        node_id: String,
        master_task_id: Uuid,
        matrix_values: HashMap<String, String>,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            workflow_run_id,
            node_id,
            status: TaskStatus::Pending,
            master_task_id: Some(master_task_id),
            matrix_values: Some(matrix_values),
            started_at: None,
            ended_at: None,
            error: None,
            outputs: HashMap::new(),
            logs: Vec::new(),
        }
    }
}
