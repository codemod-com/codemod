use anyhow::Result;
use clap::Args;
use log::info;

#[derive(Args, Debug)]
pub struct Command {
    /// Path to codemod directory
    path: Option<String>,
    /// Explicit version
    #[arg(long)]
    version: Option<String>,
    /// Target registry URL
    #[arg(long)]
    registry: Option<String>,
    /// Tag for the release
    #[arg(long)]
    tag: Option<String>,
    /// Access level
    #[arg(long)]
    access: Option<String>,
    /// Validate and pack without uploading
    #[arg(long)]
    dry_run: bool,
    /// Override existing version
    #[arg(long)]
    force: bool,
}

pub fn handler(_args: &Command) -> Result<()> {
    info!("'publish' command is not yet implemented.");
    Ok(())
}
