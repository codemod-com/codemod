use schemars::JsonSchema;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use ts_rs::TS;
/// Type of state schema property
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, JsonSchema, TS)]
#[serde(rename_all = "lowercase")]
pub enum StateSchemaType {
    /// Array type
    Array,

    /// Object type
    Object,

    /// String type
    String,

    /// Number type
    Number,

    /// Boolean type
    Boolean,
}

/// Represents a state schema property
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct StateSchemaProperty {
    /// Type of the property
    pub r#type: StateSchemaType,

    /// Description of the property
    #[serde(default)]
    pub description: Option<String>,
}

/// Represents a state schema definition
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct StateSchema {
    /// Name of the state schema
    pub name: String,

    /// Type of the state schema
    pub r#type: StateSchemaType,

    /// For array types, the schema of the items
    #[serde(default)]
    pub items: Option<Box<StateSchemaItems>>,

    /// Description of the state schema
    #[serde(default)]
    pub description: Option<String>,
}

/// Represents the schema for items in an array
#[derive(Debug, Clone, Serialize, Deserialize, JsonSchema, TS)]
pub struct StateSchemaItems {
    /// Type of the items
    pub r#type: StateSchemaType,

    /// For object types, the properties of the object
    #[serde(default)]
    pub properties: Option<HashMap<String, StateSchemaProperty>>,
}
