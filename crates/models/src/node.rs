use crate::runtime::Runtime;
use crate::step::Step;
use crate::strategy::Strategy;
use crate::trigger::Trigger;
use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;

/// Type of node
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema, TS)]
#[serde(rename_all = "lowercase")]
pub enum NodeType {
    /// Automatic node (runs when dependencies are satisfied)
    Automatic,

    /// Manual node (requires explicit triggering)
    Manual,
}

/// Represents a node in a workflow
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct Node {
    /// Unique identifier for the node
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Detailed description of what the node does
    #[serde(default)]
    #[ts(optional=nullable)]
    pub description: Option<String>,

    /// Type of node (automatic or manual)
    #[serde(default = "default_node_type")]
    pub r#type: NodeType,

    /// IDs of nodes that must complete before this node can run
    #[serde(default)]
    #[ts(type = "string[]")]
    pub depends_on: Vec<String>,

    /// Configuration for how the node is triggered
    #[serde(default)]
    #[ts(optional=nullable)]
    pub trigger: Option<Trigger>,

    /// Configuration for running multiple instances of this node
    #[serde(default)]
    #[ts(optional=nullable)]
    pub strategy: Option<Strategy>,

    /// Container runtime configuration
    #[serde(default)]
    #[ts(optional=nullable)]
    pub runtime: Option<Runtime>,

    /// Steps to execute within the node
    pub steps: Vec<Step>,

    /// Environment variables to inject into the container
    #[serde(default)]
    #[ts(type = "Record<string, string>")]
    pub env: HashMap<String, String>,
}

fn default_node_type() -> NodeType {
    NodeType::Automatic
}
