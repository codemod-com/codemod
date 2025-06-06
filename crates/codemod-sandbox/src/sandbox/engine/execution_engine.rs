use super::config::ExecutionConfig;
use crate::sandbox::errors::ExecutionError;
use crate::sandbox::filesystem::FileSystem;
use crate::sandbox::loaders::ModuleLoader;
use crate::sandbox::resolvers::ModuleResolver;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;

#[cfg(feature = "native")]
use {
    super::quickjs_adapters::{QuickJSLoader, QuickJSResolver},
    crate::ast_grep::AstGrepModule,
    llrt_modules::module_builder::ModuleBuilder,
    rquickjs_git::{async_with, context::EvalOptions, AsyncContext, AsyncRuntime, Error},
};

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
        js_code: &str,
        target_dir: &Path,
    ) -> Result<(), ExecutionError> {
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

        // Use ignore::WalkParallel for efficient parallel directory walking and processing
        use ignore::{WalkBuilder, WalkState};

        let max_concurrent = self.config.max_threads.unwrap_or_else(|| {
            std::thread::available_parallelism()
                .map(|n| n.get())
                .unwrap_or(4)
        });

        let js_code = Arc::new(js_code.to_string());
        let config = Arc::clone(&self.config);
        let processed_count = Arc::new(std::sync::atomic::AtomicUsize::new(0));
        let errors = Arc::new(std::sync::Mutex::new(Vec::new()));

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
                let js_code = Arc::clone(&js_code);
                let config = Arc::clone(&config);
                let processed_count = Arc::clone(&processed_count);
                let errors = Arc::clone(&errors);

                Box::new(move |entry_result| {
                    match entry_result {
                        Ok(entry) => {
                            // Only process files, not directories
                            if entry.file_type().is_some_and(|ft| ft.is_file()) {
                                let file_path = entry.path();

                                // Create a runtime for this thread
                                let rt = tokio::runtime::Builder::new_current_thread()
                                    .enable_all()
                                    .build()
                                    .unwrap();

                                rt.block_on(async {
                                    if let Err(e) =
                                        Self::execute_on_single_file(&config, &js_code, file_path)
                                            .await
                                    {
                                        let error_msg = format!(
                                            "Error processing file {}: {}",
                                            file_path.display(),
                                            e
                                        );
                                        eprintln!("{}", error_msg);
                                        errors.lock().unwrap().push(error_msg);
                                    } else {
                                        processed_count
                                            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                                    }
                                });
                            }
                        }
                        Err(err) => {
                            let error_msg = format!("Error walking directory: {}", err);
                            eprintln!("{}", error_msg);
                            errors.lock().unwrap().push(error_msg);
                        }
                    }
                    WalkState::Continue
                })
            });

            let count = processed_count.load(std::sync::atomic::Ordering::Relaxed);
            if count == 0 {
                return Err(ExecutionError::NoFilesFound);
            }

            println!("Successfully processed {} files", count);
            Ok(())
        })
        .await
        .map_err(|e| ExecutionError::ThreadExecution {
            message: format!("Directory processing failed: {:?}", e),
        })??;

        Ok(())
    }

    /// Execute JavaScript code on a specific list of files
    pub async fn execute_on_files(
        &self,
        js_code: &str,
        target_files: Vec<PathBuf>,
    ) -> Result<(), ExecutionError> {
        if target_files.is_empty() {
            return Err(ExecutionError::NoFilesFound);
        }

        // Use ignore's WalkParallel for efficient parallel processing
        let max_concurrent = self.config.max_threads.unwrap_or_else(|| {
            std::thread::available_parallelism()
                .map(|n| n.get())
                .unwrap_or(4)
        });

        let js_code = Arc::new(js_code.to_string());
        let config = Arc::clone(&self.config);
        let errors = Arc::new(std::sync::Mutex::new(Vec::new()));

        // Process files in parallel using a thread pool
        let chunk_size = target_files.len().div_ceil(max_concurrent);
        let mut handles = Vec::new();

        for chunk in target_files.chunks(chunk_size) {
            let chunk = chunk.to_vec();
            let js_code = Arc::clone(&js_code);
            let config = Arc::clone(&config);
            let errors = Arc::clone(&errors);

            let handle = std::thread::spawn(move || {
                let rt = tokio::runtime::Builder::new_current_thread()
                    .enable_all()
                    .build()
                    .unwrap();

                rt.block_on(async {
                    for file_path in chunk {
                        if let Err(e) =
                            Self::execute_on_single_file(&config, &js_code, &file_path).await
                        {
                            let error_msg =
                                format!("Error processing file {}: {}", file_path.display(), e);
                            eprintln!("{}", error_msg);
                            errors.lock().unwrap().push(error_msg);
                        }
                    }
                })
            });

            handles.push(handle);
        }

        // Wait for all threads to complete
        for handle in handles {
            if let Err(e) = handle.join() {
                return Err(ExecutionError::ThreadExecution {
                    message: format!("Thread execution failed: {:?}", e),
                });
            }
        }

        Ok(())
    }

    /// Execute JavaScript code from string with mock filesystem
    pub async fn execute_from_string(
        &self,
        js_code: &str,
        _mock_files: HashMap<PathBuf, String>,
    ) -> Result<(), ExecutionError> {
        // For now, just execute the JavaScript code without file processing
        // In a more complete implementation, you would set up the mock files
        // and then process them similar to execute_on_files

        // This is a simplified implementation that just runs the JS code once
        let dummy_file = PathBuf::from("__mock__.js");
        Self::execute_on_single_file(&self.config, &Arc::new(js_code.to_string()), &dummy_file)
            .await
    }

    /// Execute JavaScript code on a single file
    async fn execute_on_single_file(
        config: &Arc<ExecutionConfig<F, R, L>>,
        js_code: &str,
        target_file_path: &Path,
    ) -> Result<(), ExecutionError> {
        #[cfg(feature = "native")]
        {
            Self::execute_with_quickjs(config, js_code, target_file_path).await
        }

        #[cfg(not(feature = "native"))]
        {
            // For non-native builds (like WASM), we would use a different execution strategy
            Err(ExecutionError::Configuration {
                message: "JavaScript execution not supported in this build configuration"
                    .to_string(),
            })
        }
    }

    #[cfg(feature = "native")]
    async fn execute_with_quickjs(
        config: &Arc<ExecutionConfig<F, R, L>>,
        js_code: &str,
        target_file_path: &Path,
    ) -> Result<(), ExecutionError> {
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

        // Attach global modules
        async_with!(context => |ctx| {
            global_attachment.attach(&ctx)?;
            Ok::<_, Error>(())
        })
        .await
        .map_err(|e| ExecutionError::Runtime {
            source: crate::sandbox::errors::RuntimeError::InitializationFailed {
                message: format!("Failed to attach global modules: {}", e),
            },
        })?;

        // Execute JavaScript code
        async_with!(context => |ctx| {
            // Set the current file path
            let file_path_str = target_file_path.to_string_lossy();
            ctx.globals().set("__CURRENT_FILE_PATH__", file_path_str.as_ref())?;

            // Set up evaluation options
            let mut options = EvalOptions::default();
            options.global = false;
            options.strict = true;

            // Execute JavaScript
            if let Err(Error::Exception) = ctx.eval_with_options::<(), _>(
                js_code.as_bytes(),
                options
            ) {
                eprintln!("JavaScript Error in file {}: {:#?}", target_file_path.display(), ctx.catch());
            }

            Ok::<_, Error>(())
        })
        .await
        .map_err(|e| ExecutionError::Runtime {
            source: crate::sandbox::errors::RuntimeError::ExecutionFailed {
                message: format!("JavaScript execution failed: {}", e),
            },
        })?;

        Ok(())
    }
}
