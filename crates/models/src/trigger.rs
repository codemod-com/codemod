use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

/// Type of trigger
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum TriggerType {
    /// Automatic trigger (runs when dependencies are satisfied)
    Automatic,

    /// Manual trigger (requires explicit triggering)
    Manual,
}

/// Represents a trigger configuration
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema)]
pub struct Trigger {
    /// Type of trigger
    pub r#type: TriggerType,
}

impl Default for Trigger {
    fn default() -> Self {
        Self {
            r#type: TriggerType::Automatic,
        }
    }
}
