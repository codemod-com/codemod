use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Represents a step in a node
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Step {
    /// Unique identifier for the step
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Detailed description of what the step does
    #[serde(default)]
    pub description: Option<String>,

    /// Template to use for this step
    #[serde(default)]
    pub uses: Option<Vec<TemplateUse>>,

    /// Commands to run
    #[serde(default)]
    pub commands: Option<Vec<String>>,

    /// Environment variables specific to this step
    #[serde(default)]
    pub env: Option<HashMap<String, String>>,
}

/// Represents a template use in a step
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplateUse {
    /// Template ID to use
    pub template: String,

    /// Inputs to pass to the template
    #[serde(default)]
    pub inputs: HashMap<String, String>,
}
