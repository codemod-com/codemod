use crate::sandbox::errors::LoaderError;

/// Trait for loading module content
///
/// This trait abstracts the process of loading module source code,
/// allowing for different loading strategies (filesystem-based, mock, etc.)
pub trait ModuleLoader: Send + Sync {
    /// Load module content by name/path
    ///
    /// # Arguments
    /// * `name` - The module name or path to load
    ///
    /// # Returns
    /// The module source code as a string
    fn load(
        &self,
        name: &str,
    ) -> impl std::future::Future<Output = Result<String, LoaderError>> + Send;
}
