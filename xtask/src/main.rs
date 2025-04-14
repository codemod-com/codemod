use std::{fs::File, path::Path};

use butterflow_models::Workflow;
use clap::{Parser, Subcommand};
use serde_json::to_writer_pretty;

#[derive(Parser)]
#[command(author, version, about)]
struct Args {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Generate a JSON schema for the workflow object.
    Schema,
}

fn main() {
    let args = Args::parse();

    match args.command {
        Commands::Schema => {
            let schema = schemars::schema_for!(Workflow);
            let Ok(xtask_path) = std::env::var("CARGO_MANIFEST_DIR") else {
                panic!("Cannot find CARGO_MANIFEST_DIR");
            };
            let rule_path = Path::new(&xtask_path)
                .parent()
                .unwrap()
                .join("schemas/workflow.json");
            let Ok(mut file) = File::create(&rule_path) else {
                panic!("Cannot create file: {:?}", rule_path);
            };
            to_writer_pretty(&mut file, &schema).unwrap();
        }
    }
}
