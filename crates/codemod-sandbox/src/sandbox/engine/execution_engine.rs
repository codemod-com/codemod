use super::config::ExecutionConfig;
use super::language_data::get_extensions_for_language;
use super::quickjs_adapters::{QuickJSLoader, QuickJSResolver};
use crate::ast_grep::AstGrepModule;
use crate::rquickjs_compat::{CatchResultExt, Function, Module};
use crate::sandbox::errors::ExecutionError;
use crate::sandbox::filesystem::FileSystem;
use crate::sandbox::loaders::ModuleLoader;
use crate::sandbox::resolvers::ModuleResolver;
use ast_grep_language::SupportLang;
use ignore::{WalkBuilder, WalkState};
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

        let language = self.config.language.unwrap_or(SupportLang::TypeScript);

        let config = Arc::clone(&self.config);
        let modified_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let unmodified_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let error_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let errors = Arc::new(std::sync::Mutex::new(Vec::new()));
        let script_path = Arc::new(script_path.to_path_buf());
        let ts_extensions =
            Arc::new(self.config.extensions.as_ref().cloned().unwrap_or_else(|| {
                get_extensions_for_language(language)
                    .into_iter()
                    .map(|s| s.to_string())
                    .collect()
            }));

        // Execute in a blocking context since WalkParallel is synchronous
        let target_dir = target_dir.to_path_buf();
        tokio::task::spawn_blocking(move || {
            let mut walk_builder = WalkBuilder::new(target_dir);
            walk_builder
                .git_ignore(config.walk_options.respect_gitignore)
                .hidden(!config.walk_options.include_hidden)
                .threads(max_concurrent);

            if let Some(max_depth) = config.walk_options.max_depth {
                walk_builder.max_depth(Some(max_depth));
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

                            if entry.file_type().is_some_and(|ft| ft.is_dir())
                                || !ts_extensions
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
                            let error_msg = format!("Error walking directory: {}", err);
                            errors.lock().unwrap().push(error_msg);
                        }
                    }
                    WalkState::Continue
                })
            });

            let modified = modified_count.load(std::sync::atomic::Ordering::Relaxed);
            let unmodified = unmodified_count.load(std::sync::atomic::Ordering::Relaxed);
            let errors = error_count.load(std::sync::atomic::Ordering::Relaxed);

            if modified + unmodified + errors == 0 {
                return Err(ExecutionError::NoFilesFound);
            }

            Ok(ExecutionStats {
                files_modified: modified,
                files_unmodified: unmodified,
                files_with_errors: errors,
            })
        })
        .await
        .map_err(|e| ExecutionError::ThreadExecution {
            message: format!("Directory processing failed: {:?}", e),
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
                message: format!("Failed to create AsyncRuntime: {}", e),
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
                    message: format!("Failed to create AsyncContext: {}", e),
                },
            })?;

        // Execute JavaScript code
        let result: Result<Option<String>, ExecutionError> = async_with!(context => |ctx| {
            global_attachment.attach(&ctx).map_err(|e| ExecutionError::Runtime {
                source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                    message: format!("Failed to attach global modules: {}", e),
                },
            })?;

            let execution = async {
                let module = Module::declare(ctx.clone(), "__codemod_entry.js", js_code)
                    .catch(&ctx)
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: format!("Failed to declare module: {}", e),
                        },
                    })?;

                // Set the current file path for the codemod
                let file_path_str = target_file_path.to_string_lossy();
                ctx.globals()
                    .set("CODEMOD_TARGET_FILE_PATH", file_path_str.as_ref())
                    .map_err(|e| ExecutionError::Runtime {
                        source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                            message: format!("Failed to set global variable: {}", e),
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

        match result {
            Ok(Some(new_content)) => {
                let original_content =
                    tokio::fs::read_to_string(target_file_path)
                        .await
                        .map_err(|e| ExecutionError::Configuration {
                            message: format!(
                                "Failed to read file {}: {}",
                                target_file_path.display(),
                                e
                            ),
                        })?;
                if new_content == original_content {
                    return Ok(ExecutionResult::Unmodified);
                }

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
            Ok(None) => Ok(ExecutionResult::Unmodified),
            Err(e) => Err(e),
        }
    }
}
