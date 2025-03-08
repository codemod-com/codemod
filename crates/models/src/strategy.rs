use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Type of strategy
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum StrategyType {
    /// Matrix strategy (run multiple instances with different inputs)
    Matrix,
}

/// Represents a strategy configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Strategy {
    /// Type of strategy
    pub r#type: StrategyType,

    /// Matrix values (for matrix strategy)
    #[serde(default)]
    pub values: Option<Vec<HashMap<String, String>>>,

    /// State key to get matrix values from (for matrix strategy)
    #[serde(default)]
    pub from_state: Option<String>,
}
