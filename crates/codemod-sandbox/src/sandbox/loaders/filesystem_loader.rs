use super::traits::ModuleLoader;
use crate::sandbox::errors::LoaderError;
use crate::sandbox::filesystem::FileSystem;
use std::path::Path;
use std::sync::Arc;

/// Filesystem-based module loader
///
/// This loader uses a FileSystem implementation to load module content from files.
pub struct FileSystemLoader<F: FileSystem> {
    filesystem: Arc<F>,
}

impl<F: FileSystem> FileSystemLoader<F> {
    pub fn new(filesystem: Arc<F>) -> Self {
        Self { filesystem }
    }
}

impl<F: FileSystem> ModuleLoader for FileSystemLoader<F> {
    async fn load(&self, name: &str) -> Result<String, LoaderError> {
        let path = Path::new(name);

        // Check if the file exists and is a file
        if !self.filesystem.exists(path).await {
            return Err(LoaderError::LoadingFailed {
                name: name.to_string(),
            });
        }

        if !self.filesystem.is_file(path).await {
            return Err(LoaderError::LoadingFailed {
                name: name.to_string(),
            });
        }

        // Read the file content
        self.filesystem
            .read_to_string(path)
            .await
            .map_err(|fs_err| LoaderError::FileSystemError {
                name: name.to_string(),
                source: fs_err,
            })
    }
}
