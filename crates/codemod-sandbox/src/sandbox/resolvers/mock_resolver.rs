use super::traits::ModuleResolver;
use crate::sandbox::errors::ResolverError;
use std::collections::HashMap;
use std::sync::RwLock;

/// Mock module resolver for testing
///
/// This resolver uses a predefined mapping of module names to paths,
/// useful for testing scenarios where you want to control module resolution.
#[derive(Debug)]
pub struct MockResolver {
    modules: RwLock<HashMap<String, String>>,
}

impl MockResolver {
    pub fn new() -> Self {
        Self {
            modules: RwLock::new(HashMap::new()),
        }
    }

    /// Add a module mapping
    pub fn add_module<S1: Into<String>, S2: Into<String>>(&self, name: S1, path: S2) {
        self.modules
            .write()
            .unwrap()
            .insert(name.into(), path.into());
    }

    /// Remove a module mapping
    pub fn remove_module(&self, name: &str) {
        self.modules.write().unwrap().remove(name);
    }

    /// Clear all module mappings
    pub fn clear(&self) {
        self.modules.write().unwrap().clear();
    }

    /// Get all module mappings (for debugging)
    pub fn list_modules(&self) -> HashMap<String, String> {
        self.modules.read().unwrap().clone()
    }
}

impl Default for MockResolver {
    fn default() -> Self {
        Self::new()
    }
}

impl ModuleResolver for MockResolver {
    fn resolve(&self, _base: &str, name: &str) -> Result<String, ResolverError> {
        self.modules
            .read()
            .unwrap()
            .get(name)
            .cloned()
            .ok_or_else(|| ResolverError::ModuleNotFound {
                name: name.to_string(),
            })
    }
}
