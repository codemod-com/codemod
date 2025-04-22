use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;
/// Type of strategy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema, TS)]
#[serde(rename_all = "lowercase")]
pub enum StrategyType {
    /// Matrix strategy (run multiple instances with different inputs)
    Matrix,
}

/// Represents a strategy configuration
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct Strategy {
    /// Type of strategy
    pub r#type: StrategyType,

    /// Matrix values (for matrix strategy)
    #[serde(default)]
    #[ts(optional, as = "Option<Vec<HashMap<String, serde_json::Value>>>")]
    pub values: Option<Vec<HashMap<String, serde_json::Value>>>,

    /// State key to get matrix values from (for matrix strategy)
    #[serde(default)]
    #[ts(optional=nullable)]
    pub from_state: Option<String>,
}
