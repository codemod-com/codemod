use crate::sandbox::errors::FsError;
use std::future::Future;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone)]
pub struct WalkOptions {
    pub respect_gitignore: bool,
    pub include_hidden: bool,
    pub max_depth: Option<usize>,
}

impl Default for WalkOptions {
    fn default() -> Self {
        Self {
            respect_gitignore: true,
            include_hidden: false,
            max_depth: None,
        }
    }
}

/// Abstraction over file system operations
///
/// This trait allows for both real file system operations and mock implementations
/// for testing and in-memory execution scenarios.
pub trait FileSystem: Send + Sync {
    /// Read the contents of a file as a string
    fn read_to_string(
        &self,
        path: &Path,
    ) -> impl std::future::Future<Output = Result<String, FsError>> + Send;

    /// Check if a path exists
    fn exists(&self, path: &Path) -> impl Future<Output = bool> + Send;

    /// Check if a path is a file
    fn is_file(&self, path: &Path) -> impl Future<Output = bool> + Send;

    /// Check if a path is a directory
    fn is_dir(&self, path: &Path) -> impl Future<Output = bool> + Send;

    /// Canonicalize a path (resolve symlinks, relative paths, etc.)
    fn canonicalize(&self, path: &Path) -> impl Future<Output = Result<PathBuf, FsError>> + Send;

    /// Walk a directory and return all file paths matching the options
    fn walk_dir(
        &self,
        path: &Path,
        options: WalkOptions,
    ) -> impl Future<Output = Result<Vec<PathBuf>, FsError>> + Send;

    /// Get the parent directory of a path
    fn parent(&self, path: &Path) -> Option<PathBuf> {
        path.parent().map(|p| p.to_path_buf())
    }

    /// Join two paths
    fn join(&self, base: &Path, path: &Path) -> PathBuf {
        base.join(path)
    }
}
