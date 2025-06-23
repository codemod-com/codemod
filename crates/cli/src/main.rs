use anyhow::Result;
use clap::{Args, Parser, Subcommand};

mod auth;
mod commands;
mod engine;
mod workflow_runner;

#[derive(Parser)]
#[command(name = "codemod")]
#[command(about = "A self-hostable workflow engine for code transformations", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    /// Verbose output
    #[arg(short, long)]
    verbose: bool,
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

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));

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

    // Handle command
    match &cli.command {
        Commands::Workflow(args) => match &args.command {
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
        Commands::Jssg(args) => match &args.command {
            JssgCommands::Run(args) => {
                commands::jssg::run::handler(args).await?;
            }
            JssgCommands::Test(args) => {
                commands::jssg::test::handler(args).await?;
            }
        },
        Commands::Init(args) => {
            commands::init::handler(args)?;
        }
        Commands::Login(args) => {
            commands::login::handler(args).await?;
        }
        Commands::Logout(args) => {
            commands::logout::handler(args).await?;
        }
        Commands::Whoami(args) => {
            commands::whoami::handler(args).await?;
        }
        Commands::Publish(args) => {
            commands::publish::handler(args).await?;
        }
        Commands::Search(args) => {
            commands::search::handler(args).await?;
        }
        Commands::Run(args) => {
            commands::run::handler(&engine, args).await?;
        }
        Commands::Cache(args) => {
            commands::cache::handler(args).await?;
        }
    }

    Ok(())
}
