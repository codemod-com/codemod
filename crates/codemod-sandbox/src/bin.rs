use codemod_sandbox::sandbox::{
    engine::{ExecutionConfig, ExecutionEngine},
    filesystem::{RealFileSystem, WalkOptions},
    loaders::FileSystemLoader,
    resolvers::FileSystemResolver,
};
use std::{env, path::Path, sync::Arc};

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args: Vec<String> = env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: {} <path-to-js-file> <target-directory> [--no-gitignore] [--include-hidden] [--max-threads=N]", args[0]);
        eprintln!("");
        eprintln!("Options:");
        eprintln!("  --no-gitignore     Don't respect .gitignore files");
        eprintln!("  --include-hidden   Include hidden files and directories");
        eprintln!(
            "  --max-threads=N    Set maximum number of concurrent threads (default: CPU cores)"
        );
        std::process::exit(1);
    }

    let js_file_path = Path::new(&args[1]);
    let target_directory = Path::new(&args[2]);

    // Set up the new modular system
    let filesystem = Arc::new(RealFileSystem::new());
    let script_base_dir = js_file_path
        .parent()
        .unwrap_or(Path::new("."))
        .to_path_buf();
    println!("script_base_dir: {}", script_base_dir.display());
    let resolver = Arc::new(FileSystemResolver::new(
        filesystem.clone(),
        script_base_dir.clone(),
    ));
    let loader = Arc::new(FileSystemLoader::new(filesystem.clone()));

    let mut config = ExecutionConfig::new(filesystem, resolver, loader, script_base_dir);
    let mut walk_options = WalkOptions::default();

    // Parse additional arguments
    for arg in &args[3..] {
        match arg.as_str() {
            "--no-gitignore" => {
                walk_options.respect_gitignore = false;
            }
            "--include-hidden" => {
                walk_options.include_hidden = true;
            }
            _ if arg.starts_with("--max-threads=") => {
                if let Some(value) = arg.strip_prefix("--max-threads=") {
                    match value.parse::<usize>() {
                        Ok(threads) if threads > 0 => {
                            config = config.with_max_threads(threads);
                        }
                        _ => {
                            eprintln!("Error: Invalid max-threads value: {}", value);
                            std::process::exit(1);
                        }
                    }
                } else {
                    eprintln!("Error: --max-threads requires a value");
                    std::process::exit(1);
                }
            }
            _ => {
                eprintln!("Error: Unknown argument: {}", arg);
                std::process::exit(1);
            }
        }
    }

    config = config.with_walk_options(walk_options);

    // Read the JavaScript file
    let js_content = std::fs::read_to_string(js_file_path).map_err(|e| {
        format!(
            "Failed to read JavaScript file '{}': {}",
            js_file_path.display(),
            e
        )
    })?;

    // Create and run the execution engine
    let engine = ExecutionEngine::new(config);
    if let Err(e) = engine
        .execute_on_directory(&js_content, target_directory)
        .await
    {
        eprintln!("Error: {}", e);
        std::process::exit(1);
    }

    Ok(())
}
