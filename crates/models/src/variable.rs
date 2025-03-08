use regex::Regex;
use serde_json::Value;
use std::collections::HashMap;

use crate::error::Error;
use crate::Result;

/// Represents a variable reference
#[derive(Debug, Clone)]
pub struct VariableReference {
    /// Full variable reference (e.g., "${params.repo_url}")
    pub full_reference: String,

    /// Variable type (params, env, state, tasks)
    pub var_type: String,

    /// Variable name
    pub name: String,

    /// For task outputs, the task ID
    pub task_id: Option<String>,

    /// For task outputs, the output name
    pub output_name: Option<String>,
}

impl VariableReference {
    /// Parse a variable reference from a string
    pub fn parse(reference: &str) -> Result<Self> {
        // Match ${...} pattern
        let re = Regex::new(r"\$\{([^}]+)\}").unwrap();
        let captures = re.captures(reference).ok_or_else(|| {
            Error::VariableResolution(format!("Invalid variable reference: {}", reference))
        })?;

        let inner = captures.get(1).unwrap().as_str();

        // Parse the variable type and name
        if inner.starts_with("params.") {
            Ok(Self {
                full_reference: reference.to_string(),
                var_type: "params".to_string(),
                name: inner["params.".len()..].to_string(),
                task_id: None,
                output_name: None,
            })
        } else if inner.starts_with("env.") {
            Ok(Self {
                full_reference: reference.to_string(),
                var_type: "env".to_string(),
                name: inner["env.".len()..].to_string(),
                task_id: None,
                output_name: None,
            })
        } else if inner.starts_with("state.") {
            Ok(Self {
                full_reference: reference.to_string(),
                var_type: "state".to_string(),
                name: inner["state.".len()..].to_string(),
                task_id: None,
                output_name: None,
            })
        } else if inner.starts_with("tasks.") {
            // Parse tasks.node_id.outputs.name
            let parts: Vec<&str> = inner.split('.').collect();
            if parts.len() != 4 || parts[2] != "outputs" {
                return Err(Error::VariableResolution(format!(
                    "Invalid task output reference: {}",
                    reference
                )));
            }

            Ok(Self {
                full_reference: reference.to_string(),
                var_type: "tasks".to_string(),
                name: parts[3].to_string(),
                task_id: Some(parts[1].to_string()),
                output_name: Some(parts[3].to_string()),
            })
        } else {
            Err(Error::VariableResolution(format!(
                "Unknown variable type: {}",
                reference
            )))
        }
    }
}

/// Resolve variables in a string
pub fn resolve_variables(
    input: &str,
    params: &HashMap<String, String>,
    env: &HashMap<String, String>,
    state: &HashMap<String, Value>,
    task_outputs: &HashMap<String, HashMap<String, Value>>,
    matrix_values: Option<&HashMap<String, String>>,
) -> Result<String> {
    let re = Regex::new(r"\$\{([^}]+)\}").unwrap();
    let mut result = input.to_string();

    for captures in re.captures_iter(input) {
        let full_match = captures.get(0).unwrap().as_str();
        let inner = captures.get(1).unwrap().as_str();

        let replacement = if let Some(matrix_values) = matrix_values {
            // First check if it's a direct matrix value
            if matrix_values.contains_key(inner) {
                matrix_values.get(inner).unwrap().clone()
            } else if inner.starts_with("params.") {
                let name = &inner["params.".len()..];
                params.get(name).cloned().ok_or_else(|| {
                    Error::VariableResolution(format!("Parameter not found: {}", name))
                })?
            } else if inner.starts_with("env.") {
                let name = &inner["env.".len()..];
                env.get(name).cloned().ok_or_else(|| {
                    Error::VariableResolution(format!("Environment variable not found: {}", name))
                })?
            } else if inner.starts_with("state.") {
                let name = &inner["state.".len()..];
                let value = state.get(name).ok_or_else(|| {
                    Error::VariableResolution(format!("State value not found: {}", name))
                })?;
                value.to_string()
            } else if inner.starts_with("tasks.") {
                let parts: Vec<&str> = inner.split('.').collect();
                if parts.len() != 4 || parts[2] != "outputs" {
                    return Err(Error::VariableResolution(format!(
                        "Invalid task output reference: {}",
                        full_match
                    )));
                }

                let task_id = parts[1];
                let output_name = parts[3];

                let task_output = task_outputs.get(task_id).ok_or_else(|| {
                    Error::VariableResolution(format!("Task not found: {}", task_id))
                })?;

                let output = task_output.get(output_name).ok_or_else(|| {
                    Error::VariableResolution(format!(
                        "Output not found: {} in task {}",
                        output_name, task_id
                    ))
                })?;

                output.to_string()
            } else {
                return Err(Error::VariableResolution(format!(
                    "Unknown variable type: {}",
                    inner
                )));
            }
        } else {
            // No matrix values, resolve normally
            if inner.starts_with("params.") {
                let name = &inner["params.".len()..];
                params.get(name).cloned().ok_or_else(|| {
                    Error::VariableResolution(format!("Parameter not found: {}", name))
                })?
            } else if inner.starts_with("env.") {
                let name = &inner["env.".len()..];
                env.get(name).cloned().ok_or_else(|| {
                    Error::VariableResolution(format!("Environment variable not found: {}", name))
                })?
            } else if inner.starts_with("state.") {
                let name = &inner["state.".len()..];
                let value = state.get(name).ok_or_else(|| {
                    Error::VariableResolution(format!("State value not found: {}", name))
                })?;
                value.to_string()
            } else if inner.starts_with("tasks.") {
                let parts: Vec<&str> = inner.split('.').collect();
                if parts.len() != 4 || parts[2] != "outputs" {
                    return Err(Error::VariableResolution(format!(
                        "Invalid task output reference: {}",
                        full_match
                    )));
                }

                let task_id = parts[1];
                let output_name = parts[3];

                let task_output = task_outputs.get(task_id).ok_or_else(|| {
                    Error::VariableResolution(format!("Task not found: {}", task_id))
                })?;

                let output = task_output.get(output_name).ok_or_else(|| {
                    Error::VariableResolution(format!(
                        "Output not found: {} in task {}",
                        output_name, task_id
                    ))
                })?;

                output.to_string()
            } else {
                return Err(Error::VariableResolution(format!(
                    "Unknown variable type: {}",
                    inner
                )));
            }
        };

        result = result.replace(full_match, &replacement);
    }

    Ok(result)
}
