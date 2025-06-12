use super::traits::ModuleLoader;
use crate::sandbox::errors::LoaderError;
use std::collections::HashMap;
use std::sync::RwLock;

/// Mock module loader for testing
///
/// This loader uses a predefined mapping of module names to source code,
/// useful for testing scenarios where you want to control module content.
#[derive(Debug)]
pub struct MockLoader {
    modules: RwLock<HashMap<String, String>>,
}

impl MockLoader {
    pub fn new() -> Self {
        Self {
            modules: RwLock::new(HashMap::new()),
        }
    }

    /// Add a module with its source code
    pub fn add_module<S1: Into<String>, S2: Into<String>>(&self, name: S1, source: S2) {
        self.modules
            .write()
            .unwrap()
            .insert(name.into(), source.into());
    }

    /// Remove a module
    pub fn remove_module(&self, name: &str) {
        self.modules.write().unwrap().remove(name);
    }

    /// Clear all modules
    pub fn clear(&self) {
        self.modules.write().unwrap().clear();
    }

    /// Get all modules (for debugging)
    pub fn list_modules(&self) -> HashMap<String, String> {
        self.modules.read().unwrap().clone()
    }
}

impl Default for MockLoader {
    fn default() -> Self {
        Self::new()
    }
}

impl ModuleLoader for MockLoader {
    async fn load(&self, name: &str) -> Result<String, LoaderError> {
        self.modules
            .read()
            .unwrap()
            .get(name)
            .cloned()
            .ok_or_else(|| LoaderError::LoadingFailed {
                name: name.to_string(),
            })
    }
}
