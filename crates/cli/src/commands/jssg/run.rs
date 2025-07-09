use anyhow::Result;
use clap::Args;
use codemod_sandbox::sandbox::{
    engine::{ExecutionConfig, ExecutionEngine},
    filesystem::{RealFileSystem, WalkOptions},
    loaders::FileSystemLoader,
    resolvers::FileSystemResolver,
};
use codemod_sandbox::tree_sitter::SupportedLanguage;
use std::{path::Path, str::FromStr, sync::Arc};

#[derive(Args, Debug)]
pub struct Command {
    /// Path to the JavaScript file to execute
    pub js_file: String,

    /// Target directory to process
    pub target_directory: String,

    /// Don't respect .gitignore files
    #[arg(long)]
    pub no_gitignore: bool,

    /// Include hidden files and directories
    #[arg(long)]
    pub include_hidden: bool,

    /// Set maximum number of concurrent threads (default: CPU cores)
    #[arg(long)]
    pub max_threads: Option<usize>,

    /// Perform a dry run without making changes
    #[arg(long)]
    pub dry_run: bool,

    /// Language to process
    #[arg(long)]
    pub language: Option<String>,

    /// File extensions to process (comma-separated)
    #[arg(long)]
    pub extensions: Option<String>,
}

pub async fn handler(args: &Command) -> Result<()> {
    let js_file_path = Path::new(&args.js_file);
    let target_directory = Path::new(&args.target_directory);

    // Set up the new modular system
    let filesystem = Arc::new(RealFileSystem::new());
    let script_base_dir = js_file_path
        .parent()
        .unwrap_or(Path::new("."))
        .to_path_buf();
    let resolver = Arc::new(FileSystemResolver::new(
        filesystem.clone(),
        script_base_dir.clone(),
    ));
    let loader = Arc::new(FileSystemLoader::new(filesystem.clone()));

    let mut config = ExecutionConfig::new(filesystem, resolver, loader, script_base_dir);
    let mut walk_options = WalkOptions::default();

    // Apply command line options
    if args.no_gitignore {
        walk_options.respect_gitignore = false;
    }

    if args.include_hidden {
        walk_options.include_hidden = true;
    }

    if args.dry_run {
        config = config.with_dry_run(true);
    }

    if let Some(threads) = args.max_threads {
        if threads > 0 {
            config = config.with_max_threads(threads);
        } else {
            anyhow::bail!("max-threads must be greater than 0");
        }
    }

    if let Some(language) = args.language.as_ref() {
        config = config.with_language(
            SupportedLanguage::from_str(language).unwrap_or(SupportedLanguage::Typescript),
        );
    } else {
        config = config.with_language(SupportedLanguage::Typescript);
    }

    if let Some(extensions) = &args.extensions {
        config = config.with_extensions(extensions.split(',').map(|s| s.to_string()).collect());
    }

    config = config.with_walk_options(walk_options);

    // Verify the JavaScript file exists
    if !js_file_path.exists() {
        anyhow::bail!(
            "JavaScript file '{}' does not exist",
            js_file_path.display()
        );
    }

    // Create and run the execution engine
    let engine = ExecutionEngine::new(config);
    let stats = engine
        .execute_on_directory(js_file_path, target_directory)
        .await?;

    println!("Modified files: {:?}", stats.files_modified);
    println!("Unmodified files: {:?}", stats.files_unmodified);
    println!("Files with errors: {:?}", stats.files_with_errors);

    Ok(())
}
