use super::traits::{FileSystem, WalkOptions};
use crate::sandbox::errors::FsError;
use ignore::WalkBuilder;
use std::path::{Path, PathBuf};
use tokio::fs;

/// Real filesystem implementation using tokio::fs and ignore crate
#[derive(Debug, Clone)]
pub struct RealFileSystem;

impl RealFileSystem {
    pub fn new() -> Self {
        Self
    }
}

impl Default for RealFileSystem {
    fn default() -> Self {
        Self::new()
    }
}

impl FileSystem for RealFileSystem {
    async fn read_to_string(&self, path: &Path) -> Result<String, FsError> {
        fs::read_to_string(path)
            .await
            .map_err(|err| match err.kind() {
                std::io::ErrorKind::NotFound => FsError::FileNotFound {
                    path: path.to_path_buf(),
                },
                std::io::ErrorKind::PermissionDenied => FsError::PermissionDenied {
                    path: path.to_path_buf(),
                },
                _ => FsError::Io {
                    message: format!("Failed to read file '{}': {}", path.display(), err),
                },
            })
    }

    async fn exists(&self, path: &Path) -> bool {
        fs::try_exists(path).await.unwrap_or(false)
    }

    async fn is_file(&self, path: &Path) -> bool {
        fs::metadata(path)
            .await
            .map(|metadata| metadata.is_file())
            .unwrap_or(false)
    }

    async fn is_dir(&self, path: &Path) -> bool {
        fs::metadata(path)
            .await
            .map(|metadata| metadata.is_dir())
            .unwrap_or(false)
    }

    async fn canonicalize(&self, path: &Path) -> Result<PathBuf, FsError> {
        fs::canonicalize(path)
            .await
            .map_err(|_| FsError::CanonicalizationFailed {
                path: path.to_path_buf(),
            })
    }

    async fn walk_dir(&self, path: &Path, options: WalkOptions) -> Result<Vec<PathBuf>, FsError> {
        // Use tokio::task::spawn_blocking to run the synchronous ignore crate in a blocking task
        let path = path.to_path_buf();
        let file_paths = tokio::task::spawn_blocking(move || {
            let mut walk_builder = WalkBuilder::new(&path);
            walk_builder
                .git_ignore(options.respect_gitignore)
                .hidden(!options.include_hidden);

            if let Some(max_depth) = options.max_depth {
                walk_builder.max_depth(Some(max_depth));
            }

            let mut file_paths = Vec::new();
            for entry in walk_builder.build() {
                match entry {
                    Ok(entry) => {
                        if entry.file_type().is_some_and(|ft| ft.is_file()) {
                            file_paths.push(entry.into_path());
                        }
                    }
                    Err(err) => {
                        eprintln!("Warning: Error walking directory: {err}");
                    }
                }
            }
            file_paths
        })
        .await
        .map_err(|err| FsError::Io {
            message: format!("Failed to walk directory: {err}"),
        })?;

        Ok(file_paths)
    }
}
