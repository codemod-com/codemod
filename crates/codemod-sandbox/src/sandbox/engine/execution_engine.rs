use super::config::ExecutionConfig;
use crate::sandbox::errors::ExecutionError;
use crate::sandbox::filesystem::FileSystem;
use crate::sandbox::loaders::ModuleLoader;
use crate::sandbox::resolvers::ModuleResolver;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::thread;

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

    /// Execute JavaScript code on all files in a directory
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

        // Walk the directory to get all files
        let file_paths = self
            .config
            .filesystem
            .walk_dir(target_dir, self.config.walk_options.clone())
            .await?;

        if file_paths.is_empty() {
            return Err(ExecutionError::NoFilesFound);
        }

        println!("Processing {} files...", file_paths.len());

        self.execute_on_files(js_code, file_paths).await
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

        // Determine the number of concurrent threads
        let max_concurrent = self.config.max_threads.unwrap_or_else(|| {
            std::thread::available_parallelism()
                .map(|n| n.get())
                .unwrap_or(4)
        });

        // Process files using optimized thread pool
        let chunk_size = (target_files.len() + max_concurrent - 1) / max_concurrent;
        let mut handles = Vec::new();

        let js_code = Arc::new(js_code.to_string());

        for chunk in target_files.chunks(chunk_size) {
            let chunk = chunk.to_vec();
            let js_code = Arc::clone(&js_code);
            let config = Arc::clone(&self.config);

            let handle = thread::spawn(move || {
                // Create a new tokio runtime for this thread
                let rt = tokio::runtime::Runtime::new().unwrap();
                rt.block_on(async move {
                    for file_path in chunk {
                        if let Err(e) =
                            Self::execute_on_single_file(&config, &js_code, &file_path).await
                        {
                            eprintln!("Error processing file {}: {}", file_path.display(), e);
                        }
                    }
                });
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
