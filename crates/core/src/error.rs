use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("YAML parsing error: {0}")]
    YamlParsing(#[from] serde_yaml::Error),

    #[error("JSON parsing error: {0}")]
    JsonParsing(#[from] serde_json::Error),

    #[error("Workflow validation error: {0}")]
    WorkflowValidation(String),

    #[error("Node not found: {0}")]
    NodeNotFound(String),

    #[error("Task not found: {0}")]
    TaskNotFound(String),

    #[error("Cyclic dependency detected: {0}")]
    CyclicDependency(String),

    #[error("Variable resolution error: {0}")]
    VariableResolution(String),

    #[error("Runtime error: {0}")]
    Runtime(String),

    #[error("State error: {0}")]
    State(String),

    #[error("Template error: {0}")]
    Template(String),

    #[error("Matrix error: {0}")]
    Matrix(String),

    #[error("Docker error: {0}")]
    Docker(String),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Other error: {0}")]
    Other(String),

    #[error("Tree-sitter error: {0}")]
    TreeSitter(String),
}
