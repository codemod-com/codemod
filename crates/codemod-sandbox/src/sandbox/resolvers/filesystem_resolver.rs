use super::traits::ModuleResolver;
use crate::sandbox::errors::ResolverError;
use crate::sandbox::filesystem::FileSystem;
use std::marker::PhantomData;
use std::path::{Path, PathBuf};
use std::sync::Arc;

/// Filesystem-based module resolver
///
/// This resolver uses a FileSystem implementation to resolve module paths
/// relative to a base directory.
pub struct FileSystemResolver<F: FileSystem> {
    _filesystem: PhantomData<F>,
    base_dir: PathBuf,
}

impl<F: FileSystem> FileSystemResolver<F> {
    pub fn new(_filesystem: Arc<F>, base_dir: PathBuf) -> Self {
        Self {
            _filesystem: PhantomData,
            base_dir,
        }
    }
}

impl<F: FileSystem> ModuleResolver for FileSystemResolver<F> {
    fn resolve(&self, base: &str, name: &str) -> Result<String, ResolverError> {
        // Handle relative imports
        if name.starts_with("./") || name.starts_with("../") {
            let base_path = if base.is_empty() {
                self.base_dir.clone()
            } else {
                let base_file = Path::new(base);
                if base_file.is_absolute() {
                    base_file.parent().unwrap_or(&self.base_dir).to_path_buf()
                } else {
                    self.base_dir
                        .join(base_file.parent().unwrap_or(Path::new("")))
                }
            };

            let resolved_path = base_path.join(name);

            // For now, we'll do a simple path resolution without async filesystem checks
            // In a more sophisticated implementation, you might want to check if the file exists
            match resolved_path.canonicalize() {
                Ok(canonical_path) => Ok(canonical_path.to_string_lossy().to_string()),
                Err(_) => {
                    // If canonicalization fails, try to construct a reasonable path
                    let normalized = normalize_path(&resolved_path);
                    Ok(normalized.to_string_lossy().to_string())
                }
            }
        } else {
            // For non-relative imports, return an error to let other resolvers handle it
            Err(ResolverError::ResolutionFailed {
                base: base.to_string(),
                name: name.to_string(),
            })
        }
    }
}

/// Normalize a path by resolving . and .. components
fn normalize_path(path: &Path) -> PathBuf {
    let mut components = Vec::new();

    for component in path.components() {
        match component {
            std::path::Component::CurDir => {
                // Skip current directory references
            }
            std::path::Component::ParentDir => {
                // Pop the last component if possible
                components.pop();
            }
            _ => {
                components.push(component);
            }
        }
    }

    components.iter().collect()
}
