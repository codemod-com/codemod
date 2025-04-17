use regex::Regex;
use serde_json::Value;
use std::collections::HashMap;

use crate::error::Error;
use crate::Result;

/// Resolve variables in a string
pub fn resolve_variables(
    input: &str,
    params: &HashMap<String, String>,
    state: &HashMap<String, Value>,
    matrix_values: Option<&HashMap<String, String>>,
) -> Result<String> {
    let re = Regex::new(r"\$\{\{([^}]+)\}\}").unwrap();
    let mut result = input.to_string();

    for captures in re.captures_iter(input) {
        let full_match = captures.get(0).unwrap().as_str();
        let inner = captures.get(1).unwrap().as_str();

        let replacement =
            // First check if it's a direct matrix value
            if matrix_values.is_some_and(|matrix_values| matrix_values.contains_key(inner)) {
                matrix_values.unwrap().get(inner).unwrap().clone()
            } else if let Some(name) = inner.strip_prefix("params.") {
                params.get(name).cloned().ok_or_else(|| {
                    Error::VariableResolution(format!("Parameter not found: {}", name))
                })?
            } else if let Some(name) = inner.strip_prefix("state.") {
                let value = state.get(name).ok_or_else(|| {
                    Error::VariableResolution(format!("State value not found: {}", name))
                })?;
                value.to_string()
            } else {
                return Err(Error::VariableResolution(format!(
                    "Unknown variable type: {}",
                    inner
                )));
            };

        result = result.replace(full_match, &replacement);
    }

    Ok(result)
}
