use anyhow::Result;
use clap::{Args, Parser, Subcommand};
use log::info;
mod ascii_art;
mod auth;
mod auth_provider;
mod commands;
mod dirty_git_check;
mod engine;
mod workflow_runner;
use ascii_art::print_ascii_art;
use codemod_telemetry::{
    send_event::{PostHogSender, TelemetrySender, TelemetrySenderOptions},
    send_null::NullSender,
};

use crate::auth::TokenStorage;

#[derive(Parser)]
#[command(name = "codemod")]
#[command(
    about = "A self-hostable workflow engine for code transformations",
    long_about = "\x1b[32m      __                  __                                    __         \x1b[0m\n\x1b[32m     / /                 /\\ \\                                  /\\ \\        \x1b[0m\n\x1b[32m    / /   ___     ___    \\_\\ \\      __     ___ ___      ___    \\_\\ \\       \x1b[0m\n\x1b[32m   / /   /'___\\  / __`\\  /'_` \\   /'__`\\ /' __` __`\\   / __`\\  /'_` \\      \x1b[0m\n\x1b[32m  / /   /\\ \\__/ /\\ \\L\\ \\/\\ \\L\\ \\ /\\  __/ /\\ \\/\\ \\/\\ \\ /\\ \\L\\ \\/\\ \\L\\ \\  __ \x1b[0m\n\x1b[32m /_/    \\ \\____\\\\ \\____/\\ \\___,_\\\\ \\____\\\\ \\_\\ \\_\\ \\_\\\\ \\____/\\ \\___,_\\/\\_\\\x1b[0m\n\x1b[32m/_/      \\/____/ \\/___/  \\/__,_ / \\/____/ \\/_/\\/_/\\/_/ \\/___/  \\/__,_ /\\/_/\x1b[0m\n\x1b[32m                                                                           \x1b[0m\n\x1b[32m                                                                           \x1b[0m\n\nA self-hostable workflow engine for code transformations"
)]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,

    /// Verbose output
    #[arg(short, long)]
    verbose: bool,

    #[arg(trailing_var_arg = true, allow_hyphen_values = true, hide = true)]
    trailing_args: Vec<String>,
}

#[derive(Subcommand)]
enum Commands {
    /// Manage workflows
    Workflow(WorkflowArgs),

    /// JavaScript ast-grep execution
    Jssg(JssgArgs),

    /// Initialize a new workflow
    Init(commands::init::Command),

    /// Login to a registry
    Login(commands::login::Command),

    /// Logout from a registry
    Logout(commands::logout::Command),

    /// Show current authentication status
    Whoami(commands::whoami::Command),

    /// Publish a workflow
    Publish(commands::publish::Command),

    /// Search for packages in the registry
    Search(commands::search::Command),

    /// Run a codemod from the registry
    Run(commands::run::Command),

    /// Unpublish a package from the registry
    Unpublish(commands::unpublish::Command),

    /// Manage package cache
    Cache(commands::cache::Command),
}

#[derive(Args, Debug)]
struct WorkflowArgs {
    #[command(subcommand)]
    command: WorkflowCommands,
}

#[derive(Args, Debug)]
struct JssgArgs {
    #[command(subcommand)]
    command: JssgCommands,
}

#[derive(Subcommand, Debug)]
enum WorkflowCommands {
    /// Run a workflow
    Run(commands::workflow::run::Command),

    /// Resume a paused workflow
    Resume(commands::workflow::resume::Command),

    /// Validate a workflow file
    Validate(commands::workflow::validate::Command),

    /// Show workflow run status
    Status(commands::workflow::status::Command),

    /// List workflow runs
    List(commands::workflow::list::Command),

    /// Cancel a workflow run
    Cancel(commands::workflow::cancel::Command),
}

#[derive(Subcommand, Debug)]
enum JssgCommands {
    /// Run JavaScript code transformation
    Run(commands::jssg::run::Command),
    /// Test JavaScript code transformations
    Test(commands::jssg::test::Command),
}

/// Check if a string looks like a package name that should be run
fn is_package_name(arg: &str) -> bool {
    // Check for scoped packages (@org/package)
    if arg.starts_with('@') && arg.contains('/') {
        return true;
    }

    // Check for package with version (@org/package@1.0.0 or package@1.0.0)
    if arg.contains('@') && !arg.starts_with('@') {
        return true;
    }

    // Check for simple package names (exclude known subcommands)
    let known_commands = [
        "workflow",
        "jssg",
        "init",
        "login",
        "logout",
        "whoami",
        "publish",
        "search",
        "run",
        "unpublish",
        "cache",
    ];

    !known_commands.contains(&arg)
}

/// Handle implicit run command from trailing arguments
async fn handle_implicit_run_command(
    engine: &butterflow_core::engine::Engine,
    trailing_args: Vec<String>,
    telemetry_sender: &dyn TelemetrySender,
) -> Result<bool> {
    if trailing_args.is_empty() {
        return Ok(false);
    }

    let package = &trailing_args[0];
    if !is_package_name(package) {
        return Ok(false);
    }

    // Construct arguments for clap parsing as if "run" was specified
    let mut full_args = vec!["codemod".to_string(), "run".to_string()];
    full_args.extend(trailing_args.clone());

    // Re-parse the entire CLI with the run command included
    match Cli::try_parse_from(&full_args) {
        Ok(new_cli) => {
            if let Some(Commands::Run(run_args)) = new_cli.command {
                commands::run::handler(engine, &run_args, telemetry_sender).await?;
                Ok(true)
            } else {
                Ok(false)
            }
        }
        Err(e) => {
            if e.kind() == clap::error::ErrorKind::UnknownArgument {
                info!("Unknown argument, falling back to legacy codemod runner.");
                commands::run::run_legacy_codemod_with_raw_args(&trailing_args).await?;
                return Ok(true);
            }
            Ok(false)
        }
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("error"));

    // Parse command line arguments
    let cli = Cli::parse();

    // Set log level based on verbose flag
    if cli.verbose {
        std::env::set_var("RUST_LOG", "debug");
    } else {
        std::env::set_var("RUST_LOG", "info");
    }

    // Create engine
    let engine = engine::create_engine()?;

    let telemetry_sender: Box<dyn codemod_telemetry::send_event::TelemetrySender> =
        if std::env::var("DISABLE_ANALYTICS") == Ok("true".to_string())
            || std::env::var("DISABLE_ANALYTICS") == Ok("1".to_string())
        {
            Box::new(NullSender {})
        } else {
            let storage = TokenStorage::new()?;
            let config = storage.load_config()?;

            let auth = storage.get_auth_for_registry(&config.default_registry)?;

            let distinct_id = auth
                .map(|auth| auth.user.id)
                .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());

            Box::new(
                PostHogSender::new(TelemetrySenderOptions {
                    distinct_id,
                    cloud_role: "CLI".to_string(),
                })
                .await,
            )
        };

    // Handle command or implicit run
    match &cli.command {
        Some(Commands::Workflow(args)) => match &args.command {
            WorkflowCommands::Run(args) => {
                commands::workflow::run::handler(&engine, args).await?;
            }
            WorkflowCommands::Resume(args) => {
                commands::workflow::resume::handler(&engine, args).await?;
            }
            WorkflowCommands::Validate(args) => {
                commands::workflow::validate::handler(args)?;
            }
            WorkflowCommands::Status(args) => {
                commands::workflow::status::handler(&engine, args).await?;
            }
            WorkflowCommands::List(args) => {
                commands::workflow::list::handler(&engine, args).await?;
            }
            WorkflowCommands::Cancel(args) => {
                commands::workflow::cancel::handler(&engine, args).await?;
            }
        },
        Some(Commands::Jssg(args)) => match &args.command {
            JssgCommands::Run(args) => {
                commands::jssg::run::handler(args).await?;
            }
            JssgCommands::Test(args) => {
                commands::jssg::test::handler(args).await?;
            }
        },
        Some(Commands::Init(args)) => {
            commands::init::handler(args)?;
        }
        Some(Commands::Login(args)) => {
            commands::login::handler(args).await?;
        }
        Some(Commands::Logout(args)) => {
            commands::logout::handler(args).await?;
        }
        Some(Commands::Whoami(args)) => {
            commands::whoami::handler(args).await?;
        }
        Some(Commands::Publish(args)) => {
            commands::publish::handler(args, telemetry_sender.as_ref()).await?;
        }
        Some(Commands::Search(args)) => {
            commands::search::handler(args).await?;
        }
        Some(Commands::Run(args)) => {
            commands::run::handler(&engine, args, telemetry_sender.as_ref()).await?;
        }
        Some(Commands::Unpublish(args)) => {
            commands::unpublish::handler(args).await?;
        }
        Some(Commands::Cache(args)) => {
            commands::cache::handler(args).await?;
        }
        None => {
            // Try to parse as implicit run command
            if !handle_implicit_run_command(&engine, cli.trailing_args, telemetry_sender.as_ref())
                .await?
            {
                // No valid subcommand or package name provided, show help
                print_ascii_art();
                eprintln!("No command provided. Use --help for usage information.");
                std::process::exit(1);
            }
        }
    }

    Ok(())
}
