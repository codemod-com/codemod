use anyhow::{anyhow, Result};
use clap::Args;
use log::{info, warn};

use crate::auth::{OidcClient, TokenStorage};

#[derive(Args, Debug)]
pub struct Command {
    /// Registry URL
    #[arg(long)]
    registry: Option<String>,
    /// Organization or user scope for publishing
    #[arg(long)]
    scope: Option<String>,
}

pub async fn handler(args: &Command) -> Result<()> {
    let storage = TokenStorage::new()?;
    let config = storage.load_config()?;

    let registry_url = args
        .registry
        .as_ref()
        .unwrap_or(&config.default_registry)
        .clone();

    let registry_config = config
        .registries
        .get(&registry_url)
        .ok_or_else(|| anyhow!("Unknown registry: {}", registry_url))?
        .clone();

    info!("Authenticating with registry: {registry_url}");

    let oidc_client = OidcClient::new(registry_url.clone(), registry_config)?;

    // Check current auth status
    if let Ok(Some(stored_auth)) = oidc_client.get_auth_status() {
        println!(
            "✓ Already logged in as {} ({})",
            stored_auth.user.username, registry_url
        );

        if let Some(organizations) = &stored_auth.user.organizations {
            println!(
                "Organizations: {}",
                organizations
                    .iter()
                    .map(|org| format!("{} ({})", org.name, org.role))
                    .collect::<Vec<_>>()
                    .join(", ")
            );
        }

        println!("Use 'codemod logout' to log out or 'codemod login --registry <url>' to log in to a different registry.");
        return Ok(());
    }

    // Start OIDC login flow
    match oidc_client.login().await {
        Ok(auth) => {
            if let Some(scope) = &args.scope {
                info!("Setting default publish scope to {scope}");
                // TODO: Save scope preference to config
            }

            if let Some(organizations) = &auth.user.organizations {
                println!("Available organizations:");
                for org in organizations {
                    println!("  - {} ({})", org.name, org.role);
                }
            }

            println!("\nYou can now publish packages using 'codemod publish'");
            Ok(())
        }
        Err(e) => {
            warn!("Authentication failed: {e}");
            Err(anyhow!("Login failed: {}", e))
        }
    }
}
