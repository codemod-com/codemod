use crate::sandbox::filesystem::{FileSystem, WalkOptions};
use crate::sandbox::loaders::ModuleLoader;
use crate::sandbox::resolvers::ModuleResolver;
use std::path::PathBuf;
use std::sync::Arc;

/// Configuration for JavaScript execution
pub struct ExecutionConfig<F, R, L>
where
    F: FileSystem,
    R: ModuleResolver,
    L: ModuleLoader,
{
    /// Filesystem implementation to use
    pub filesystem: Arc<F>,
    /// Module resolver implementation to use
    pub resolver: Arc<R>,
    /// Module loader implementation to use
    pub loader: Arc<L>,
    /// Base directory for script resolution
    pub script_base_dir: PathBuf,
    /// Maximum number of concurrent threads for parallel execution
    pub max_threads: Option<usize>,
    /// Options for directory walking
    pub walk_options: WalkOptions,
}

impl<F, R, L> ExecutionConfig<F, R, L>
where
    F: FileSystem,
    R: ModuleResolver,
    L: ModuleLoader,
{
    pub fn new(
        filesystem: Arc<F>,
        resolver: Arc<R>,
        loader: Arc<L>,
        script_base_dir: PathBuf,
    ) -> Self {
        Self {
            filesystem,
            resolver,
            loader,
            script_base_dir,
            max_threads: None,
            walk_options: WalkOptions::default(),
        }
    }

    pub fn with_max_threads(mut self, max_threads: usize) -> Self {
        self.max_threads = Some(max_threads);
        self
    }

    pub fn with_walk_options(mut self, walk_options: WalkOptions) -> Self {
        self.walk_options = walk_options;
        self
    }

    pub fn with_gitignore(mut self, respect_gitignore: bool) -> Self {
        self.walk_options.respect_gitignore = respect_gitignore;
        self
    }

    pub fn with_hidden(mut self, include_hidden: bool) -> Self {
        self.walk_options.include_hidden = include_hidden;
        self
    }

    pub fn with_max_depth(mut self, max_depth: usize) -> Self {
        self.walk_options.max_depth = Some(max_depth);
        self
    }
}
