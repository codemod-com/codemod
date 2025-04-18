use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

use crate::runtime::Runtime;
use crate::step::Step;
use crate::strategy::Strategy;

/// Type of node
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum NodeType {
    /// Automatic node (runs when dependencies are satisfied)
    Automatic,

    /// Manual node (requires explicit triggering)
    Manual,
}

/// Represents a node in a workflow
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct Node {
    /// Unique identifier for the node
    pub id: String,

    /// Human-readable name
    pub name: String,

    /// Detailed description of what the node does
    #[serde(default)]
    pub description: Option<String>,

    /// Type of node (automatic or manual)
    #[serde(default = "default_node_type")]
    pub r#type: NodeType,

    /// IDs of nodes that must complete before this node can run
    #[serde(default)]
    pub depends_on: Vec<String>,

    /// Configuration for running multiple instances of this node
    #[serde(default)]
    pub strategy: Option<Strategy>,

    /// Container runtime configuration
    #[serde(default)]
    pub runtime: Option<Runtime>,

    /// Steps to execute within the node
    pub steps: Vec<Step>,

    /// Environment variables to inject into the container
    #[serde(default)]
    pub env: HashMap<String, String>,
}

fn default_node_type() -> NodeType {
    NodeType::Automatic
}
