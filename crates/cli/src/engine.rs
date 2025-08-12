use anyhow::Result;
use butterflow_core::config::WorkflowRunConfig;
use butterflow_core::engine::Engine;
use butterflow_state::cloud_adapter::CloudStateAdapter;

/// Create an engine based on configuration
pub fn create_engine() -> Result<Engine> {
    // Check for environment variables first
    if let (Some(backend), Some(endpoint), auth_token) = (
        std::env::var("BUTTERFLOW_STATE_BACKEND").ok(),
        std::env::var("BUTTERFLOW_API_ENDPOINT").ok(),
        std::env::var("BUTTERFLOW_API_AUTH_TOKEN")
            .ok()
            .unwrap_or_default(),
    ) {
        if backend == "cloud" {
            // Create API state adapter
            let state_adapter = Box::new(CloudStateAdapter::new(endpoint, auth_token));
            return Ok(Engine::with_state_adapter(
                state_adapter,
                WorkflowRunConfig::default(),
            ));
        }
    }

    Ok(Engine::with_workflow_run_config(
        WorkflowRunConfig::default(),
    ))
}
