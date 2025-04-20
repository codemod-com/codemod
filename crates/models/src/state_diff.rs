use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;
use uuid::Uuid;

/// Represents a diff operation
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
pub enum DiffOperation {
    /// Add a new value
    Add,
    /// Update an existing value
    Update,
    /// Remove an existing value
    Remove,
    /// Append to an array
    Append,
}

/// Represents a diff for a single field
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct FieldDiff {
    /// The operation to perform
    pub operation: DiffOperation,
    /// The new value (for Add and Update operations)
    pub value: Option<serde_json::Value>,
}

/// Represents a diff for a workflow run
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct WorkflowRunDiff {
    /// The ID of the workflow run
    pub workflow_run_id: Uuid,
    /// The fields to update
    pub fields: HashMap<String, FieldDiff>,
}

/// Represents a diff for a task
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct TaskDiff {
    /// The ID of the task
    pub task_id: Uuid,
    /// The fields to update
    pub fields: HashMap<String, FieldDiff>,
}

/// Represents a diff for workflow state
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct StateDiff {
    /// The ID of the workflow run
    pub workflow_run_id: Uuid,
    /// The fields to update
    pub fields: HashMap<String, FieldDiff>,
}
