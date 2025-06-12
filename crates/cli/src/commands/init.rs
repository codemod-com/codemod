use anyhow::Result;
use clap::Args;
use log::info;

#[derive(Args, Debug)]
pub struct Command {
    /// Set the project name
    #[arg(long)]
    name: Option<String>,
    /// Overwrite existing files
    #[arg(long)]
    force: bool,
    /// Target directory path
    path: Option<String>,
}

pub fn handler(_args: &Command) -> Result<()> {
    info!("'init' command is not yet implemented.");
    Ok(())
}
