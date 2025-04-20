use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;
/// Represents a step in a node
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct Step {
    /// Human-readable name
    pub name: String,

    /// Action to perform - either using a template or running a script
    #[serde(flatten)]
    pub action: StepAction,

    /// Environment variables specific to this step
    #[serde(default)]
    #[ts(type = "Record<string, string> | null", optional=nullable)]
    pub env: Option<HashMap<String, String>>,
}

/// Represents the action a step can take - either using templates or running a script
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
#[serde(rename_all = "snake_case")]
pub enum StepAction {
    /// Template to use for this step
    #[serde(rename = "use")]
    UseTemplate(TemplateUse),

    /// Script to run
    #[serde(rename = "run")]
    RunScript(String),
}

/// Represents a template use in a step
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct TemplateUse {
    /// Template ID to use
    pub template: String,

    /// Inputs to pass to the template
    #[serde(default)]
    #[ts(type = "Record<string, string>")]
    pub inputs: HashMap<String, String>,
}
