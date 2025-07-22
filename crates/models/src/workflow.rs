use anyhow::{anyhow, Result};
use chrono::{DateTime, Utc};
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;
use uuid::Uuid;

use crate::node::Node;
use crate::state::StateSchema;
use crate::template::Template;
use crate::step::StepAction;
use ts_rs::TS;

/// Represents a workflow definition
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct Workflow {
    /// Version of the workflow format
    pub version: String,

    /// Human-readable name of the workflow
    #[serde(default)]
    #[ts(optional=nullable)]
    pub name: Option<String>,

    /// Detailed description of the workflow
    #[serde(default)]
    #[ts(optional=nullable)]
    pub description: Option<String>,

    /// State schema definition
    #[serde(default)]
    #[ts(optional=nullable)]
    pub state: Option<WorkflowState>,

    // Why using as="Option<Vec<Template>>" -> https://github.com/Aleph-Alpha/ts-rs/issues/175
    /// Templates for reusable components
    #[serde(default)]
    #[ts(optional, as = "Option<Vec<Template>>")]
    pub templates: Vec<Template>,

    /// Nodes in the workflow
    pub nodes: Vec<Node>,
}

/// Represents the state schema for a workflow
#[derive(Debug, Clone, Serialize, Deserialize, Default, JsonSchema, TS)]
pub struct WorkflowState {
    /// Schema definitions
    #[serde(default)]
    pub schema: Vec<StateSchema>,
}

/// Represents a workflow run
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
pub struct WorkflowRun {
    /// Unique identifier for the workflow run
    pub id: Uuid,

    /// The workflow definition
    pub workflow: Workflow,

    /// Current status of the workflow run
    pub status: WorkflowStatus,

    /// Parameters passed to the workflow
    pub params: HashMap<String, String>,

    /// Tasks created for this workflow run
    pub tasks: Vec<Uuid>,

    /// Start time of the workflow run
    pub started_at: DateTime<Utc>,

    /// End time of the workflow run (if completed or failed)
    #[serde(default)]
    #[ts(optional=nullable)]
    pub ended_at: Option<DateTime<Utc>>,

    /// The absolute path to the root directory of the workflow bundle
    #[ts(optional=nullable)]
    pub bundle_path: Option<PathBuf>,
}

/// Status of a workflow run
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
pub enum WorkflowStatus {
    /// Workflow is pending execution
    Pending,

    /// Workflow is currently running
    Running,

    /// Workflow has completed successfully
    Completed,

    /// Workflow has failed
    Failed,

    /// Workflow is paused waiting for manual triggers
    AwaitingTrigger,

    /// Workflow has been canceled
    Canceled,
}

impl Workflow {
    /// Validate workflow's nodes and steps that use ast-grep js api
    /// by checking if the files exist in the filesystem
    pub fn validate_js_ast_grep_files(&self, base_dir: &PathBuf) -> Result<()> {
        for node in &self.nodes {
            for step in &node.steps {
                if let StepAction::JSAstGrep(js_ast_grep) = &step.action {
                    let js_file_path = base_dir.join(&js_ast_grep.js_file);

                    if !js_file_path.exists() {
                        return Err(anyhow!(
                            "JavaScript file '{}' not found for step '{}' in node '{}'",
                            js_ast_grep.js_file,
                            step.name,
                            node.name
                        ));
                    }
                    
                    if !js_file_path.is_file() {
                        return Err(anyhow!(
                            "Path '{}' exists but is not a file for step '{}' in node '{}'",
                            js_ast_grep.js_file,
                            step.name,
                            node.name
                        ));
                    }
                }
            }
        }
        
        Ok(())
    }
}