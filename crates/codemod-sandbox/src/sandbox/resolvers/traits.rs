use crate::sandbox::errors::ResolverError;

/// Trait for resolving module names to absolute paths
///
/// This trait abstracts the process of resolving module imports,
/// allowing for different resolution strategies (filesystem-based, mock, etc.)
pub trait ModuleResolver: Send + Sync {
    /// Resolve a module name to an absolute path
    ///
    /// # Arguments
    /// * `base` - The base path from which the resolution is happening
    /// * `name` - The module name to resolve
    ///
    /// # Returns
    /// The resolved absolute path as a string
    fn resolve(&self, base: &str, name: &str) -> Result<String, ResolverError>;
}
