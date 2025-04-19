use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

use crate::runtime::Runtime;
use crate::step::Step;

/// Represents a template input
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct TemplateInput {
    /// Name of the input
    pub name: String,

    /// Type of the input (string, number, boolean)
    #[serde(default = "default_input_type")]
    pub r#type: String,

    /// Whether the input is required
    #[serde(default)]
    pub required: bool,

    /// Description of the input
    #[serde(default)]
    pub description: Option<String>,

    /// Default value for the input
    #[serde(default)]
    pub default: Option<String>,
}

/// Represents a template output
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct TemplateOutput {
    /// Name of the output
    pub name: String,

    /// Value of the output
    pub value: String,

    /// Description of the output
    #[serde(default)]
    pub description: Option<String>,
}

/// Represents a reusable template
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct Template {
    /// Unique identifier for the template
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Detailed description of what the template does
    #[serde(default)]
    pub description: Option<String>,

    /// Container runtime configuration
    #[serde(default)]
    pub runtime: Option<Runtime>,

    /// Inputs for the template
    #[serde(default)]
    pub inputs: Vec<TemplateInput>,

    /// Steps to execute within the template
    pub steps: Vec<Step>,

    /// Outputs from the template
    #[serde(default)]
    pub outputs: Vec<TemplateOutput>,

    /// Environment variables to inject into the container
    #[serde(default)]
    #[ts(type = "Record<string, string>")]
    pub env: HashMap<String, String>,
}

fn default_input_type() -> String {
    "string".to_string()
}
