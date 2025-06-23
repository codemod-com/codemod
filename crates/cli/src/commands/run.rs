use anyhow::{anyhow, Result};
use clap::Args;
use log::{debug, info};
use reqwest;
use serde::Deserialize;
use serde_json;
use std::fs;
use std::path::{Path, PathBuf};
use tempfile::TempDir;
use walkdir::WalkDir;

use crate::auth::TokenStorage;
use crate::commands::cache::get_cache_dir;
use crate::workflow_runner::{run_workflow, WorkflowRunConfig};
use butterflow_core::engine::Engine;

#[derive(Args, Debug)]
pub struct Command {
    /// Package name with optional version (e.g., @org/package@1.0.0)
    #[arg(value_name = "PACKAGE")]
    package: String,

    /// Target directory to run the codemod on
    #[arg(value_name = "PATH", default_value = ".")]
    path: PathBuf,

    /// Registry URL
    #[arg(long)]
    registry: Option<String>,

    /// Force re-download even if cached
    #[arg(long)]
    force: bool,

    /// Dry run mode - don't make actual changes
    #[arg(long)]
    dry_run: bool,

    /// Additional arguments to pass to the codemod
    #[arg(last = true)]
    args: Vec<String>,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct PackageInfo {
    id: String,

    name: String,

    scope: Option<String>,
    latest_version: Option<String>,
    versions: std::collections::HashMap<String, PackageVersion>,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct PackageVersion {
    version: String,
    description: Option<String>,
    checksum: String,
    size: u32,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct DownloadResponse {
    download_url: String,
    expires_at: String,
}

struct PackageSpec {
    scope: Option<String>,
    name: String,
    version: Option<String>,
}

pub async fn handler(engine: &Engine, args: &Command) -> Result<()> {
    let storage = TokenStorage::new()?;
    let config = storage.load_config()?;

    let registry_url = args
        .registry
        .as_ref()
        .unwrap_or(&config.default_registry)
        .clone();

    // Parse package specification
    let package_spec = parse_package_spec(&args.package)?;

    info!(
        "Running codemod: {} from registry: {}",
        format_package_spec(&package_spec),
        registry_url
    );

    // Get package information
    let package_info = get_package_info(&storage, &registry_url, &package_spec).await?;

    // Determine version to use
    let version = determine_version(&package_spec, &package_info)?;

    // Get or create cache directory
    let cache_dir = get_cache_dir()?;
    let package_cache_dir = get_package_cache_dir(&cache_dir, &package_spec, &version)?;

    // Check if package is cached and valid
    let package_dir = if args.force || !is_package_cached(&package_cache_dir)? {
        info!("Downloading package: {}@{}", args.package, version);
        download_and_extract_package(
            &storage,
            &registry_url,
            &package_spec,
            &version,
            &package_cache_dir,
        )
        .await?
    } else {
        debug!("Using cached package: {}", package_cache_dir.display());
        package_cache_dir
    };

    // Validate package structure
    validate_package_structure(&package_dir)?;

    // Execute the codemod
    execute_codemod(engine, &package_dir, &args.path, &args.args, args.dry_run).await?;

    Ok(())
}

fn parse_package_spec(package: &str) -> Result<PackageSpec> {
    let (name_part, version) = if package.contains('@') {
        let parts: Vec<&str> = package.rsplitn(2, '@').collect();
        if parts.len() == 2 {
            (parts[1], Some(parts[0].to_string()))
        } else {
            (package, None)
        }
    } else {
        (package, None)
    };

    let (scope, name) = if name_part.starts_with('@') {
        let parts: Vec<&str> = name_part.splitn(2, '/').collect();
        if parts.len() == 2 {
            (Some(parts[0].to_string()), parts[1].to_string())
        } else {
            return Err(anyhow!("Invalid scoped package name: {}", name_part));
        }
    } else {
        (None, name_part.to_string())
    };

    Ok(PackageSpec {
        scope,
        name,
        version,
    })
}

fn format_package_spec(spec: &PackageSpec) -> String {
    let name = if let Some(scope) = &spec.scope {
        format!("{}/{}", scope, spec.name)
    } else {
        spec.name.clone()
    };

    if let Some(version) = &spec.version {
        format!("{}@{}", name, version)
    } else {
        name
    }
}

async fn get_package_info(
    storage: &TokenStorage,
    registry_url: &str,
    spec: &PackageSpec,
) -> Result<PackageInfo> {
    let client = reqwest::Client::new();
    let package_path = if let Some(scope) = &spec.scope {
        format!("{}/{}", scope, spec.name)
    } else {
        spec.name.clone()
    };

    let url = format!("{}/api/v1/registry/packages/{}", registry_url, package_path);
    debug!("Fetching package info from: {}", url);

    let mut request = client.get(&url);

    // Add authentication header if available
    if let Ok(Some(auth)) = storage.get_auth_for_registry(registry_url) {
        request = request.header(
            "Authorization",
            format!("Bearer {}", auth.tokens.access_token),
        );
    }

    let response = request.send().await?;

    if !response.status().is_success() {
        let status = response.status();
        if status == reqwest::StatusCode::NOT_FOUND {
            return Err(anyhow!("Package not found: {}", format_package_spec(spec)));
        } else if status == reqwest::StatusCode::FORBIDDEN {
            return Err(anyhow!(
                "Access denied to package: {}. You may need to login.",
                format_package_spec(spec)
            ));
        }

        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow!(
            "Failed to fetch package info ({}): {}",
            status,
            error_text
        ));
    }

    let package_info: PackageInfo = response.json().await?;
    Ok(package_info)
}

fn determine_version(spec: &PackageSpec, package_info: &PackageInfo) -> Result<String> {
    if let Some(version) = &spec.version {
        if package_info.versions.contains_key(version) {
            Ok(version.clone())
        } else {
            Err(anyhow!(
                "Version {} not found for package {}",
                version,
                format_package_spec(spec)
            ))
        }
    } else if let Some(latest) = &package_info.latest_version {
        Ok(latest.clone())
    } else {
        Err(anyhow!(
            "No version specified and no latest version available for package {}",
            format_package_spec(spec)
        ))
    }
}

fn get_package_cache_dir(cache_dir: &Path, spec: &PackageSpec, version: &str) -> Result<PathBuf> {
    let package_dir = if let Some(scope) = &spec.scope {
        cache_dir.join(scope).join(&spec.name).join(version)
    } else {
        cache_dir.join("global").join(&spec.name).join(version)
    };

    fs::create_dir_all(&package_dir)?;
    Ok(package_dir)
}

fn is_package_cached(package_dir: &Path) -> Result<bool> {
    if !package_dir.exists() {
        return Ok(false);
    }

    // Check for required files
    let codemod_yaml = package_dir.join("codemod.yaml");
    let workflow_yaml = package_dir.join("workflow.yaml");

    Ok(codemod_yaml.exists() && workflow_yaml.exists())
}

async fn download_and_extract_package(
    storage: &TokenStorage,
    registry_url: &str,
    spec: &PackageSpec,
    version: &str,
    cache_dir: &Path,
) -> Result<PathBuf> {
    let client = reqwest::Client::new();
    let package_path = if let Some(scope) = &spec.scope {
        format!("{}/{}", scope, spec.name)
    } else {
        spec.name.clone()
    };

    let download_url = format!(
        "{}/api/v1/registry/packages/{}/{}/download",
        registry_url, package_path, version
    );

    debug!("Downloading package from: {}", download_url);

    let mut request = client.get(&download_url);

    // Add authentication header if available
    if let Ok(Some(auth)) = storage.get_auth_for_registry(registry_url) {
        request = request.header(
            "Authorization",
            format!("Bearer {}", auth.tokens.access_token),
        );
    }

    let response = request.send().await?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response.text().await.unwrap_or_default();
        return Err(anyhow!(
            "Failed to download package ({}): {}",
            status,
            error_text
        ));
    }

    let package_data = response.bytes().await?;

    // Check if the response is a JSON redirect with download_url
    if package_data.len() >= 2 {
        let magic = &package_data[0..2];
        if magic != [0x1f, 0x8b] {
            // Check if this is a JSON response with a download_url
            if let Ok(text) = std::str::from_utf8(&package_data) {
                if text.trim().starts_with('{') {
                    // Try to parse as JSON to get the actual download URL
                    if let Ok(download_response) = serde_json::from_str::<DownloadResponse>(text) {
                        debug!(
                            "Server returned download URL: {}",
                            download_response.download_url
                        );

                        // Download from the actual URL
                        let actual_response =
                            client.get(&download_response.download_url).send().await?;

                        if !actual_response.status().is_success() {
                            let status = actual_response.status();
                            let error_text = actual_response.text().await.unwrap_or_default();
                            return Err(anyhow!(
                                "Failed to download package from CDN ({}): {}",
                                status,
                                error_text
                            ));
                        }

                        let actual_package_data = actual_response.bytes().await?;

                        // Verify this is actually a gzip file
                        if actual_package_data.len() >= 2 {
                            let actual_magic = &actual_package_data[0..2];
                            if actual_magic != [0x1f, 0x8b] {
                                return Err(anyhow!(
                                    "CDN file is not a valid gzip file. Expected magic bytes 1f 8b, got {:02x} {:02x}",
                                    actual_magic[0], actual_magic[1]
                                ));
                            }
                        }

                        // Extract to temporary directory first
                        let temp_dir = TempDir::new()?;
                        let temp_path = temp_dir.path();

                        // Extract tar.gz
                        let tar_gz = flate2::read::GzDecoder::new(&actual_package_data[..]);
                        let mut archive = tar::Archive::new(tar_gz);
                        archive.unpack(temp_path)?;

                        // Move to cache directory
                        if cache_dir.exists() {
                            fs::remove_dir_all(cache_dir)?;
                        }
                        fs::create_dir_all(cache_dir.parent().unwrap())?;

                        // Find the extracted directory (handle potential wrapper directories)
                        let extracted_dirs: Vec<_> = fs::read_dir(temp_path)?
                            .filter_map(|entry| {
                                let entry = entry.ok()?;
                                if entry.file_type().ok()?.is_dir() {
                                    Some(entry.path())
                                } else {
                                    None
                                }
                            })
                            .collect();

                        let source_dir = if extracted_dirs.len() == 1 {
                            &extracted_dirs[0]
                        } else {
                            temp_path
                        };

                        // Copy to cache directory
                        copy_dir_recursively(source_dir, cache_dir)?;

                        info!("Package cached to: {}", cache_dir.display());
                        return Ok(cache_dir.to_path_buf());
                    }
                }
            }

            // If we get here, it's not a valid gzip file or JSON response
            return Err(anyhow!(
                "Downloaded data is not a valid gzip file and not a JSON redirect. Expected gzip magic bytes 1f 8b, got {:02x} {:02x}",
                magic[0], magic[1]
            ));
        }
    }

    // If we get here, it's a direct gzip file
    // Extract to temporary directory first
    let temp_dir = TempDir::new()?;
    let temp_path = temp_dir.path();

    // Extract tar.gz
    let tar_gz = flate2::read::GzDecoder::new(&package_data[..]);
    let mut archive = tar::Archive::new(tar_gz);
    archive.unpack(temp_path)?;

    // Move to cache directory
    if cache_dir.exists() {
        fs::remove_dir_all(cache_dir)?;
    }
    fs::create_dir_all(cache_dir.parent().unwrap())?;

    // Find the extracted directory (handle potential wrapper directories)
    let extracted_dirs: Vec<_> = fs::read_dir(temp_path)?
        .filter_map(|entry| {
            let entry = entry.ok()?;
            if entry.file_type().ok()?.is_dir() {
                Some(entry.path())
            } else {
                None
            }
        })
        .collect();

    let source_dir = if extracted_dirs.len() == 1 {
        &extracted_dirs[0]
    } else {
        temp_path
    };

    // Copy to cache directory
    copy_dir_recursively(source_dir, cache_dir)?;

    info!("Package cached to: {}", cache_dir.display());
    Ok(cache_dir.to_path_buf())
}

fn copy_dir_recursively(src: &Path, dst: &Path) -> Result<()> {
    fs::create_dir_all(dst)?;

    for entry in WalkDir::new(src) {
        let entry = entry?;
        let relative_path = entry.path().strip_prefix(src)?;
        let dst_path = dst.join(relative_path);

        if entry.file_type().is_dir() {
            fs::create_dir_all(&dst_path)?;
        } else {
            if let Some(parent) = dst_path.parent() {
                fs::create_dir_all(parent)?;
            }
            fs::copy(entry.path(), &dst_path)?;
        }
    }

    Ok(())
}

fn validate_package_structure(package_dir: &Path) -> Result<()> {
    let codemod_yaml = package_dir.join("codemod.yaml");
    let workflow_yaml = package_dir.join("workflow.yaml");

    if !codemod_yaml.exists() {
        return Err(anyhow!(
            "Invalid package: missing codemod.yaml in {}",
            package_dir.display()
        ));
    }

    if !workflow_yaml.exists() {
        return Err(anyhow!(
            "Invalid package: missing workflow.yaml in {}",
            package_dir.display()
        ));
    }

    debug!("Package structure validated");
    Ok(())
}

async fn execute_codemod(
    engine: &Engine,
    package_dir: &Path,
    target_path: &Path,
    additional_args: &[String],
    dry_run: bool,
) -> Result<()> {
    let workflow_path = package_dir.join("workflow.yaml");

    info!(
        "Executing codemod on {} {}",
        target_path.display(),
        if dry_run { "(dry run)" } else { "" }
    );

    // Create parameters map from additional args
    let mut params = std::collections::HashMap::new();
    params.insert(
        "target_path".to_string(),
        target_path.to_string_lossy().to_string(),
    );

    if dry_run {
        params.insert("dry_run".to_string(), "true".to_string());
    }

    // Parse additional arguments in key=value format
    for arg in additional_args {
        if let Some((key, value)) = arg.split_once('=') {
            params.insert(key.to_string(), value.to_string());
        }
    }

    debug!("Workflow parameters: {:?}", params);

    // Create workflow run configuration
    let config = WorkflowRunConfig {
        workflow_file_path: workflow_path,
        bundle_path: package_dir.to_path_buf(),
        params,
        wait_for_completion: true,
    };

    // Run workflow using the extracted workflow runner
    run_workflow(engine, config).await?;

    Ok(())
}
