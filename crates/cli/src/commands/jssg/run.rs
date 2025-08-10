use anyhow::Result;
use clap::Args;
use codemod_sandbox::sandbox::{
    engine::{ExecutionConfig, ExecutionEngine},
    filesystem::{RealFileSystem, WalkOptions},
    resolvers::OxcResolver,
};
use std::{path::Path, sync::Arc};

use crate::progress_bar::progress_bar_for_multi_progress;
use crate::progress_bar::{ActionType, MultiProgressProgressBarCallback};
use crate::{dirty_git_check, progress_bar::ProgressCallback};
use codemod_sandbox::utils::project_discovery::find_tsconfig;

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

    /// Allow dirty git status
    #[arg(long)]
    pub allow_dirty: bool,
}

pub async fn handler(args: &Command) -> Result<()> {
    let js_file_path = Path::new(&args.js_file);
    let target_directory = Path::new(&args.target_directory);

    let dirty_check = dirty_git_check::dirty_check();
    dirty_check(target_directory, args.allow_dirty);

    // Verify the JavaScript file exists
    if !js_file_path.exists() {
        anyhow::bail!(
            "JavaScript file '{}' does not exist",
            js_file_path.display()
        );
    }

    // Set up the new modular system with OxcResolver
    let filesystem = Arc::new(RealFileSystem::new());
    let script_base_dir = js_file_path
        .parent()
        .unwrap_or(Path::new("."))
        .to_path_buf();

    let tsconfig_path = find_tsconfig(&script_base_dir);

    let resolver = Arc::new(OxcResolver::new(script_base_dir.clone(), tsconfig_path)?);

    let mut config = ExecutionConfig::new(filesystem, resolver, script_base_dir);
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

    if let Some(language) = &args.language {
        config = config.with_language(language.parse()?);
    }

    if let Some(extensions) = &args.extensions {
        config = config.with_extensions(extensions.split(',').map(|s| s.to_string()).collect());
    }

    config = config.with_walk_options(walk_options);

    // Create and run the execution engine
    let engine = ExecutionEngine::new(config);
    let (progress_bar, started) = progress_bar_for_multi_progress();

    let callback: ProgressCallback = Arc::new(
        move |id: &str, current_file: &str, action_type: &str, count: Option<&u64>, index: &u64| {
            let progress_bar = progress_bar.clone();
            let id = id.to_string();
            let current_file = current_file.to_string();
            let action_type = match action_type {
                "set_text" => ActionType::SetText,
                "next" => ActionType::Next,
                _ => ActionType::SetText,
            };
            let count = count.cloned();
            let index = *index;
            progress_bar(MultiProgressProgressBarCallback {
                id,
                current_file,
                action_type,
                count,
                index,
            });
        },
    );

    let stats = engine
        .execute_on_directory("jssg", js_file_path, target_directory, Some(callback))
        .await?;

    println!("📝 Modified files: {:?}", stats.files_modified);
    println!("✅ Unmodified files: {:?}", stats.files_unmodified);
    println!("❌ Files with errors: {:?}", stats.files_with_errors);

    let seconds = started.elapsed().as_millis() as f64 / 1000.0;
    println!("✨ Done in {seconds:.3}s");

    Ok(())
}
