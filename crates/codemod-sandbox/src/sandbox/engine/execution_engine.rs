use super::config::ExecutionConfig;
use super::language_data::get_extensions_for_language;
use super::quickjs_adapters::{QuickJSLoader, QuickJSResolver};
use crate::ast_grep::AstGrepModule;
use crate::rquickjs_compat::{CatchResultExt, Function, Module};
use crate::sandbox::errors::ExecutionError;
use crate::sandbox::filesystem::FileSystem;
use crate::sandbox::loaders::ModuleLoader;
use crate::sandbox::resolvers::ModuleResolver;
use crate::tree_sitter::{load_tree_sitter, SupportedLanguage};
use ignore::{overrides::OverrideBuilder, WalkBuilder, WalkState};
use llrt_modules::module_builder::ModuleBuilder;
use rquickjs_git::{async_with, AsyncContext, AsyncRuntime};
use std::fmt;
use std::path::Path;
use std::sync::Arc;
use tokio::io::AsyncWriteExt;

/// Statistics about the execution results
#[derive(Debug, Clone, Default)]
pub struct ExecutionStats {
    pub files_modified: usize,
    pub files_unmodified: usize,
    pub files_with_errors: usize,
}

impl ExecutionStats {
    pub fn new() -> Self {
        Self::default()
    }

    /// Total number of files processed
    pub fn total_files(&self) -> usize {
        self.files_modified + self.files_unmodified + self.files_with_errors
    }

    /// Returns true if any files were processed successfully (modified or unmodified)
    pub fn has_successful_files(&self) -> bool {
        self.files_modified > 0 || self.files_unmodified > 0
    }

    /// Returns true if any files had errors during processing
    pub fn has_errors(&self) -> bool {
        self.files_with_errors > 0
    }

    /// Returns the success rate as a percentage (0.0 to 1.0)
    pub fn success_rate(&self) -> f64 {
        let total = self.total_files();
        if total == 0 {
            0.0
        } else {
            (self.files_modified + self.files_unmodified) as f64 / total as f64
        }
    }
}

impl fmt::Display for ExecutionStats {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(
            f,
            "Execution Summary: {} files processed ({} modified, {} unmodified, {} errors)",
            self.total_files(),
            self.files_modified,
            self.files_unmodified,
            self.files_with_errors
        )
    }
}

/// Result of executing a codemod on a single file
#[derive(Debug, Clone)]
pub enum ExecutionResult {
    Modified,
    Unmodified,
    Error(String),
}

/// Output of executing a codemod on content (in-memory)
#[derive(Debug, Clone)]
pub struct ExecutionOutput {
    /// The transformed content, if any
    pub content: Option<String>,
    /// Whether the content was modified from the original
    pub modified: bool,
    /// Error message if execution failed
    pub error: Option<String>,
}

impl ExecutionOutput {
    /// Create a successful output with transformed content
    pub fn success(content: Option<String>, original_content: &str) -> Self {
        let modified = match &content {
            Some(new_content) => new_content != original_content,
            None => false,
        };

        Self {
            content,
            modified,
            error: None,
        }
    }

    /// Create an error output
    pub fn error(message: String) -> Self {
        Self {
            content: None,
            modified: false,
            error: Some(message),
        }
    }

    /// Check if the execution was successful
    pub fn is_success(&self) -> bool {
        self.error.is_none()
    }

    /// Check if the execution failed
    pub fn is_error(&self) -> bool {
        self.error.is_some()
    }
}

/// Main execution engine for running JavaScript code
///
/// This engine coordinates filesystem operations, module resolution,
/// and JavaScript execution across multiple files and threads.
pub struct ExecutionEngine<F: FileSystem, R: ModuleResolver, L: ModuleLoader> {
    config: Arc<ExecutionConfig<F, R, L>>,
}

impl<F, R, L> ExecutionEngine<F, R, L>
where
    F: FileSystem + 'static,
    R: ModuleResolver + 'static,
    L: ModuleLoader + 'static,
{
    pub fn new(config: ExecutionConfig<F, R, L>) -> Self {
        Self {
            config: Arc::new(config),
        }
    }

    /// Execute a codemod on string content without touching the filesystem
    /// This is useful for testing where we want to process content in memory
    pub async fn execute_codemod_on_content(
        &self,
        script_path: &Path,
        file_path: &Path,
        content: &str,
    ) -> Result<ExecutionOutput, ExecutionError> {
        #[cfg(feature = "native")]
        {
            Self::execute_codemod_with_quickjs(&self.config, script_path, file_path, content).await
        }

        #[cfg(not(feature = "native"))]
        {
            Ok(ExecutionOutput::error(
                "JavaScript execution not supported in this build configuration".to_string(),
            ))
        }
    }

    /// Execute JavaScript code on all files in a directory using WalkParallel
    pub async fn execute_on_directory(
        &self,
        script_path: &Path,
        target_dir: &Path,
    ) -> Result<ExecutionStats, ExecutionError> {
        // Check if target directory exists
        if !self.config.filesystem.exists(target_dir).await {
            return Err(ExecutionError::Configuration {
                message: format!("Target directory '{}' does not exist", target_dir.display()),
            });
        }

        if !self.config.filesystem.is_dir(target_dir).await {
            return Err(ExecutionError::Configuration {
                message: format!("Target path '{}' is not a directory", target_dir.display()),
            });
        }

        let max_concurrent = self.config.max_threads.unwrap_or_else(|| {
            std::thread::available_parallelism()
                .map(|n| n.get())
                .unwrap_or(4)
        });
        let language = load_tree_sitter(&[self
            .config
            .language
            .unwrap_or(SupportedLanguage::Typescript)])
        .await
        .unwrap()[0];

        let config = Arc::clone(&self.config);
        let modified_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let unmodified_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let error_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let errors = Arc::new(std::sync::Mutex::new(Vec::new()));
        let script_path = Arc::new(script_path.to_path_buf());
        let ts_extensions =
            Arc::new(self.config.extensions.as_ref().cloned().unwrap_or_else(|| {
                get_extensions_for_language(language.name())
                    .into_iter()
                    .map(|s| s.to_string())
                    .collect()
            }));

        // Execute in a blocking context since WalkParallel is synchronous
        let target_dir = target_dir.to_path_buf();
        tokio::task::spawn_blocking(move || {
            let mut walk_builder = WalkBuilder::new(&target_dir);
            walk_builder
                .git_ignore(config.walk_options.respect_gitignore)
                .hidden(!config.walk_options.include_hidden)
                .threads(max_concurrent);

            if let Some(max_depth) = config.walk_options.max_depth {
                walk_builder.max_depth(Some(max_depth));
            }

            // Build glob overrides for include/exclude patterns
            let globs = if config.include_globs.is_some() || config.exclude_globs.is_some() {
                let mut builder = OverrideBuilder::new(&target_dir);

                // Add include patterns
                if let Some(include_globs) = &config.include_globs {
                    for glob in include_globs {
                        if let Err(e) = builder.add(glob) {
                            eprintln!("Warning: Invalid include glob '{glob}': {e}");
                        }
                    }
                }

                // Add exclude patterns (prefixed with !)
                if let Some(exclude_globs) = &config.exclude_globs {
                    for glob in exclude_globs {
                        let exclude_pattern = if glob.starts_with('!') {
                            glob.to_string()
                        } else {
                            format!("!{glob}")
                        };
                        if let Err(e) = builder.add(&exclude_pattern) {
                            eprintln!("Warning: Invalid exclude glob '{exclude_pattern}': {e}");
                        }
                    }
                }

                match builder.build() {
                    Ok(overrides) => Some(overrides),
                    Err(e) => {
                        eprintln!("Warning: Failed to build glob overrides: {e}");
                        None
                    }
                }
            } else {
                None
            };

            if let Some(overrides) = globs {
                walk_builder.overrides(overrides);
            }

            walk_builder.build_parallel().run(|| {
                let config = Arc::clone(&config);
                let modified_count = Arc::clone(&modified_count);
                let unmodified_count = Arc::clone(&unmodified_count);
                let error_count = Arc::clone(&error_count);
                let errors = Arc::clone(&errors);
                let script_path = Arc::clone(&script_path);
                let ts_extensions = Arc::clone(&ts_extensions);

                Box::new(move |entry_result| {
                    match entry_result {
                        Ok(entry) => {
                            let file_path = entry.path();

                            // Skip directories
                            if entry.file_type().is_some_and(|ft| ft.is_dir()) {
                                return WalkState::Continue;
                            }

                            // If glob patterns are used, the walker already filtered files
                            // If no glob patterns, use extension filtering
                            if config.include_globs.is_none()
                                && config.exclude_globs.is_none()
                                && !ts_extensions
                                    .iter()
                                    .any(|ext| file_path.to_string_lossy().ends_with(ext))
                            {
                                return WalkState::Continue;
                            }

                            // Create a runtime for this thread
                            let rt = tokio::runtime::Builder::new_current_thread()
                                .enable_all()
                                .build()
                                .unwrap();

                            rt.block_on(async {
                                match Self::execute_on_single_file(&config, &script_path, file_path)
                                    .await
                                {
                                    Ok(ExecutionResult::Modified) => {
                                        modified_count
                                            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                                    }
                                    Ok(ExecutionResult::Unmodified) => {
                                        unmodified_count
                                            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                                    }
                                    Ok(ExecutionResult::Error(msg)) => {
                                        error_count
                                            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                                        let error_msg = format!(
                                            "Error processing file {}: {}",
                                            file_path.display(),
                                            msg
                                        );
                                        errors.lock().unwrap().push(error_msg);
                                    }
                                    Err(e) => {
                                        error_count
                                            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                                        let error_msg = format!(
                                            "Error processing file {}: {}",
                                            file_path.display(),
                                            match e {
                                                ExecutionError::Runtime { source } => {
                                                    source.to_string()
                                                }
                                                _ => e.to_string(),
                                            }
                                        );
                                        errors.lock().unwrap().push(error_msg);
                                    }
                                }
                            });
                        }
                        Err(err) => {
                            error_count.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                            let error_msg = format!("Error walking directory: {err}");
                            errors.lock().unwrap().push(error_msg);
                        }
                    }
                    WalkState::Continue
                })
            });

            let modified = modified_count.load(std::sync::atomic::Ordering::Relaxed);
            let unmodified = unmodified_count.load(std::sync::atomic::Ordering::Relaxed);
            let errors = error_count.load(std::sync::atomic::Ordering::Relaxed);

            Ok(ExecutionStats {
                files_modified: modified,
                files_unmodified: unmodified,
                files_with_errors: errors,
            })
        })
        .await
        .map_err(|e| ExecutionError::ThreadExecution {
            message: format!("Directory processing failed: {e:?}"),
        })?
    }

    /// Execute JavaScript code on a single file
    async fn execute_on_single_file(
        config: &Arc<ExecutionConfig<F, R, L>>,
        script_path: &Path,
        target_file_path: &Path,
    ) -> Result<ExecutionResult, ExecutionError> {
        #[cfg(feature = "native")]
        {
            Self::execute_with_quickjs(config, script_path, target_file_path).await
        }

        #[cfg(not(feature = "native"))]
        {
            // For non-native builds (like WASM), we would use a different execution strategy
            Ok(ExecutionResult::Error(
                "JavaScript execution not supported in this build configuration".to_string(),
            ))
        }
    }

    #[cfg(feature = "native")]
    async fn execute_with_quickjs(
        config: &Arc<ExecutionConfig<F, R, L>>,
        script_path: &Path,
        target_file_path: &Path,
    ) -> Result<ExecutionResult, ExecutionError> {
        // Read the original file content
        let original_content = tokio::fs::read_to_string(target_file_path)
            .await
            .map_err(|e| ExecutionError::Configuration {
                message: format!("Failed to read file {}: {}", target_file_path.display(), e),
            })?;

        // Execute the codemod on the content
        let execution_output = Self::execute_codemod_with_quickjs(
            config,
            script_path,
            target_file_path,
            &original_content,
        )
        .await?;

        // Handle the result
        match execution_output {
            ExecutionOutput {
                content: Some(new_content),
                modified: true,
                error: None,
            } => {
                // Write the modified content back to the file
                let mut file = tokio::fs::File::create(target_file_path)
                    .await
                    .map_err(|e| ExecutionError::Configuration {
                        message: format!(
                            "Failed to open file for writing {}: {}",
                            target_file_path.display(),
                            e
                        ),
                    })?;
                file.write_all(new_content.as_bytes()).await.map_err(|e| {
                    ExecutionError::Configuration {
                        message: format!(
                            "Failed to write to file {}: {}",
                            target_file_path.display(),
                            e
                        ),
                    }
                })?;
                Ok(ExecutionResult::Modified)
            }
            ExecutionOutput {
                modified: false,
                error: None,
                ..
            } => Ok(ExecutionResult::Unmodified),
            ExecutionOutput {
                error: Some(err), ..
            } => Ok(ExecutionResult::Error(err)),
            _ => Ok(ExecutionResult::Error(
                "Unexpected execution output state".to_string(),
            )),
        }
    }

    /// Execute a codemod on string content using QuickJS
    /// This is the core execution logic that doesn't touch the filesystem
    #[cfg(feature = "native")]
    async fn execute_codemod_with_quickjs(
        config: &Arc<ExecutionConfig<F, R, L>>,
        script_path: &Path,
        file_path: &Path,
        content: &str,
    ) -> Result<ExecutionOutput, ExecutionError> {
        use crate::utils::quickjs_utils::maybe_promise;

        let script_name = script_path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("main.js");

        let js_code = format!(
            include_str!("scripts/main_script.js.txt"),
            script_name = script_name
        );

        // Initialize QuickJS runtime and context
        let runtime = AsyncRuntime::new().map_err(|e| ExecutionError::Runtime {
            source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                message: format!("Failed to create AsyncRuntime: {e}"),
            },
        })?;

        // Set up built-in modules
        let module_builder = ModuleBuilder::default();
        let (mut built_in_resolver, mut built_in_loader, global_attachment) =
            module_builder.build();

        // Add AstGrepModule
        built_in_resolver = built_in_resolver.add_name("codemod:ast-grep");
        built_in_loader = built_in_loader.with_module("codemod:ast-grep", AstGrepModule);

        // Use our new QuickJS adapters with the script's base directory
        let fs_resolver = QuickJSResolver::new(config.script_base_dir.clone());
        let fs_loader = QuickJSLoader;

        // Combine resolvers and loaders
        runtime
            .set_loader(
                (built_in_resolver, fs_resolver),
                (built_in_loader, fs_loader),
            )
            .await;

        let context = AsyncContext::full(&runtime)
            .await
            .map_err(|e| ExecutionError::Runtime {
                source: crate::sandbox::errors::RuntimeError::ContextCreationFailed {
                    message: format!("Failed to create AsyncContext: {e}"),
                },
            })?;

        // Execute JavaScript code
        let result: Result<Option<String>, ExecutionError> = async_with!(context => |ctx| {
            global_attachment.attach(&ctx).map_err(|e| ExecutionError::Runtime {
                source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                    message: format!("Failed to attach global modules: {e}"),
                },
            })?;

            let execution = async {
                let module = Module::declare(ctx.clone(), "__codemod_entry.js", js_code)
                    .catch(&ctx)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: format!("Failed to declare module: {e}"),
                        },
                    })?;

                // Set the current file path for the codemod
                let file_path_str = file_path.to_string_lossy();
                ctx.globals()
                    .set("CODEMOD_TARGET_FILE_PATH", file_path_str.as_ref())
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: format!("Failed to set global variable: {e}"),
                        },
                    })?;

                // Set the language for the codemod
                let language_str = config.language.as_ref()
                    .map(|lang| lang.to_string())
                    .unwrap_or_else(|| "typescript".to_string());
                ctx.globals()
                    .set("CODEMOD_LANGUAGE", language_str)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: format!("Failed to set language global variable: {e}"),
                        },
                    })?;

                // Evaluate module.
                let (evaluated, _) = module
                    .eval()
                    .catch(&ctx)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: e.to_string(),
                        },
                    })?;
                while ctx.execute_pending_job() {}

                // Get the default export.
                let namespace = evaluated
                    .namespace()
                    .catch(&ctx)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: e.to_string(),
                        },
                    })?;


                let func = namespace
                    .get::<_, Function>("executeCodemod")
                    .catch(&ctx)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: e.to_string(),
                        },
                    })?;


                // Call it and return value.
                let result_obj_promise = func.call(()).catch(&ctx).map_err(|e| {
                    ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: e.to_string(),
                        },
                    }
                })?;
                let result_obj = maybe_promise(result_obj_promise)
                    .await
                    .catch(&ctx)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: e.to_string(),
                        },
                    })?;

                if result_obj.is_string() {
                    Ok(Some(result_obj.get::<String>().unwrap()))
                } else if result_obj.is_null() || result_obj.is_undefined() {
                    Ok(None)
                } else {
                    Err(ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::ExecutionFailed {
                            message: "Invalid result type".to_string(),
                        },
                    })
                }
            };
            execution.await
        })
        .await;

        // Convert the result to ExecutionOutput
        match result {
            Ok(new_content) => Ok(ExecutionOutput::success(new_content, content)),
            Err(e) => {
                println!("Error: {e:?}");
                Ok(ExecutionOutput::error(e.to_string()))
            }
        }
    }
}
