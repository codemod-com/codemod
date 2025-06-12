use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use ts_rs::TS;
/// Type of runtime
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema, TS)]
#[serde(rename_all = "lowercase")]
pub enum RuntimeType {
    /// Direct execution on the host
    Direct,

    /// Docker container execution
    Docker,

    /// Podman container execution
    Podman,
}

impl std::fmt::Display for RuntimeType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            RuntimeType::Direct => write!(f, "direct"),
            RuntimeType::Docker => write!(f, "docker"),
            RuntimeType::Podman => write!(f, "podman"),
        }
    }
}

/// Represents a runtime configuration
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct Runtime {
    /// Type of runtime
    pub r#type: RuntimeType,

    /// Container image (for Docker and Podman)
    #[serde(default)]
    #[ts(optional=nullable)]
    pub image: Option<String>,

    /// Working directory inside the container
    #[serde(default)]
    #[ts(optional=nullable)]
    pub working_dir: Option<String>,

    /// User to run as inside the container
    #[serde(default)]
    #[ts(optional=nullable)]
    pub user: Option<String>,

    /// Network mode for the container
    #[serde(default)]
    #[ts(optional=nullable)]
    pub network: Option<String>,

    /// Additional container options
    #[serde(default)]
    #[ts(optional=nullable)]
    pub options: Option<Vec<String>>,
}
