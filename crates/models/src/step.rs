use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents a step in a node
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct Step {
    /// Unique identifier for the step
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Detailed description of what the step does
    #[serde(default)]
    pub description: Option<String>,

    /// Action to perform - either using a template or running a script
    #[serde(flatten)]
    pub action: StepAction,

    /// Environment variables specific to this step
    #[serde(default)]
    pub env: Option<HashMap<String, String>>,
}

/// Represents the action a step can take - either using templates or running a script
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum StepAction {
    /// Template to use for this step
    #[serde(rename = "uses")]
    UseTemplates(Vec<TemplateUse>),

    /// Script to run
    #[serde(rename = "run")]
    RunScript(String),
}

/// Represents a template use in a step
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct TemplateUse {
    /// Template ID to use
    pub template: String,

    /// Inputs to pass to the template
    #[serde(default)]
    pub inputs: HashMap<String, String>,
}
