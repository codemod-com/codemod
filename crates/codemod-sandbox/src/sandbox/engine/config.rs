use crate::sandbox::filesystem::{FileSystem, WalkOptions};
use crate::sandbox::loaders::ModuleLoader;
use crate::sandbox::resolvers::ModuleResolver;
use crate::tree_sitter::SupportedLanguage;
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
    /// Language to use for execution
    pub language: Option<SupportedLanguage>,
    /// Extensions to use for execution
    pub extensions: Option<Vec<String>>,
    /// Include glob patterns for files to process
    pub include_globs: Option<Vec<String>>,
    /// Exclude glob patterns for files to skip
    pub exclude_globs: Option<Vec<String>>,
    /// Whether to dry run the execution
    pub dry_run: bool,
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
            language: None,
            extensions: None,
            include_globs: None,
            exclude_globs: None,
            dry_run: false,
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

    pub fn with_language(mut self, language: SupportedLanguage) -> Self {
        self.language = Some(language);
        self
    }

    pub fn with_extensions(mut self, extensions: Vec<String>) -> Self {
        self.extensions = Some(extensions);
        self
    }

    pub fn with_include_globs(mut self, include_globs: Vec<String>) -> Self {
        self.include_globs = Some(include_globs);
        self
    }

    pub fn with_exclude_globs(mut self, exclude_globs: Vec<String>) -> Self {
        self.exclude_globs = Some(exclude_globs);
        self
    }

    pub fn with_dry_run(mut self, dry_run: bool) -> Self {
        self.dry_run = dry_run;
        self
    }
}
