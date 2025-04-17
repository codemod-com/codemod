use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::Path;

use butterflow_models::step::StepAction;
use serde_yaml;

use butterflow_models::{Error, Node, Result, Workflow};

/// Parse a workflow definition from a file
pub fn parse_workflow_file<P: AsRef<Path>>(path: P) -> Result<Workflow> {
    let content = fs::read_to_string(path.as_ref())?;

    // Try to parse as YAML first
    match serde_yaml::from_str::<Workflow>(&content) {
        Ok(workflow) => Ok(workflow),
        Err(yaml_err) => {
            // If YAML parsing fails, try JSON
            match serde_json::from_str::<Workflow>(&content) {
                Ok(workflow) => Ok(workflow),
                Err(json_err) => {
                    // Both parsing attempts failed
                    Err(Error::WorkflowValidation(format!(
                        "Failed to parse workflow file. YAML error: {}, JSON error: {}",
                        yaml_err, json_err
                    )))
                }
            }
        }
    }
}

/// Validate a workflow definition
pub fn validate_workflow(workflow: &Workflow) -> Result<()> {
    // Check that all node IDs are unique
    let mut node_ids = HashSet::new();
    for node in &workflow.nodes {
        if !node_ids.insert(&node.id) {
            return Err(Error::WorkflowValidation(format!(
                "Duplicate node ID: {}",
                node.id
            )));
        }
    }

    // Check that all template IDs are unique
    let mut template_ids = HashSet::new();
    for template in &workflow.templates {
        if !template_ids.insert(&template.id) {
            return Err(Error::WorkflowValidation(format!(
                "Duplicate template ID: {}",
                template.id
            )));
        }
    }

    // Check that all dependencies exist
    for node in &workflow.nodes {
        for dep_id in &node.depends_on {
            if !node_ids.contains(dep_id) {
                return Err(Error::WorkflowValidation(format!(
                    "Node {} depends on non-existent node: {}",
                    node.id, dep_id
                )));
            }
        }
    }

    // Check for cyclic dependencies
    detect_cycles(&workflow.nodes)?;

    // Check that all template references are valid
    for node in &workflow.nodes {
        for step in &node.steps {
            if let StepAction::UseTemplates(uses) = &step.action {
                for template_use in uses {
                    if !template_ids.contains(&template_use.template) {
                        return Err(Error::WorkflowValidation(format!(
                            "Step {} in node {} uses non-existent template: {}",
                            step.id, node.id, template_use.template
                        )));
                    }
                }
            }
        }
    }

    // Check matrix strategies
    for node in &workflow.nodes {
        if let Some(strategy) = &node.strategy {
            if strategy.values.is_none() && strategy.from_state.is_none() {
                return Err(Error::WorkflowValidation(format!(
                    "Matrix strategy for node {} requires either 'values' or 'from_state'",
                    node.id
                )));
            }
        }
    }

    Ok(())
}

/// Detect cycles in the dependency graph
fn detect_cycles(nodes: &[Node]) -> Result<()> {
    // Build adjacency list
    let mut graph: HashMap<&str, Vec<&str>> = HashMap::new();
    for node in nodes {
        graph.insert(
            &node.id,
            node.depends_on.iter().map(|s| s.as_str()).collect(),
        );
    }

    // Track visited and in-progress nodes
    let mut visited = HashSet::new();
    let mut in_progress = HashSet::new();

    // DFS to detect cycles
    for node in nodes {
        if !visited.contains(node.id.as_str()) {
            if let Some(cycle) =
                dfs_cycle_detect(&graph, node.id.as_str(), &mut visited, &mut in_progress)
            {
                return Err(Error::CyclicDependency(cycle));
            }
        }
    }

    Ok(())
}

/// DFS helper for cycle detection
fn dfs_cycle_detect<'a>(
    graph: &HashMap<&'a str, Vec<&'a str>>,
    node: &'a str,
    visited: &mut HashSet<&'a str>,
    in_progress: &mut HashSet<&'a str>,
) -> Option<String> {
    // Mark node as in-progress
    in_progress.insert(node);

    // Visit all neighbors
    if let Some(neighbors) = graph.get(node) {
        for &neighbor in neighbors {
            if in_progress.contains(neighbor) {
                // Found a cycle
                let mut cycle = format!("{} → {}", node, neighbor);
                let mut current = neighbor;
                while current != node {
                    for &n in graph.keys() {
                        if let Some(deps) = graph.get(n) {
                            if deps.contains(&current) {
                                cycle = format!("{} → {}", n, cycle);
                                current = n;
                                break;
                            }
                        }
                    }
                }
                return Some(cycle);
            }

            if !visited.contains(neighbor) {
                if let Some(cycle) = dfs_cycle_detect(graph, neighbor, visited, in_progress) {
                    return Some(cycle);
                }
            }
        }
    }

    // Mark node as visited and remove from in-progress
    visited.insert(node);
    in_progress.remove(node);

    None
}

/// Parse parameters from command line arguments
pub fn parse_params(params: &[String]) -> Result<HashMap<String, String>> {
    let mut result = HashMap::new();

    for param in params {
        let parts: Vec<&str> = param.splitn(2, '=').collect();
        if parts.len() != 2 {
            return Err(Error::Other(format!(
                "Invalid parameter format: {}. Expected format: key=value",
                param
            )));
        }

        result.insert(parts[0].to_string(), parts[1].to_string());
    }

    Ok(result)
}

/// Get environment variables as a HashMap
pub fn get_env_vars() -> HashMap<String, String> {
    std::env::vars().collect()
}

/// Format a duration in seconds as HH:MM:SS
pub fn format_duration(seconds: u64) -> String {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    let seconds = seconds % 60;

    format!("{:02}:{:02}:{:02}", hours, minutes, seconds)
}
