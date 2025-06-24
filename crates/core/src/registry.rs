use anyhow::{anyhow, Result};
use log::{debug, info};
use reqwest;
use serde::Deserialize;
use serde_json;
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use tempfile::TempDir;
use walkdir::WalkDir;

#[derive(Debug, Clone)]
pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: Option<String>,
}

#[derive(Debug, Clone)]
pub struct RegistryAuth {
    pub tokens: AuthTokens,
}

#[derive(Debug, Clone)]
pub struct RegistryConfig {
    pub default_registry: String,
    pub cache_dir: PathBuf,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
struct PackageInfo {
    id: String,
    name: String,
    scope: Option<String>,
    latest_version: Option<String>,
    versions: HashMap<String, PackageVersion>,
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

#[derive(Debug, Clone)]
pub struct PackageSpec {
    pub scope: Option<String>,
    pub name: String,
    pub version: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ResolvedPackage {
    pub spec: PackageSpec,
    pub version: String,
    pub package_dir: PathBuf,
}

pub struct RegistryClient {
    config: RegistryConfig,
    auth_provider: Option<Box<dyn AuthProvider>>,
    client: reqwest::Client,
}

pub trait AuthProvider: Send + Sync {
    fn get_auth_for_registry(&self, registry_url: &str) -> Result<Option<RegistryAuth>>;
}

impl RegistryClient {
    pub fn new(config: RegistryConfig, auth_provider: Option<Box<dyn AuthProvider>>) -> Self {
        Self {
            config,
            auth_provider,
            client: reqwest::Client::new(),
        }
    }

    pub async fn resolve_package(
        &self,
        source: &str,
        registry_url: Option<&str>,
        force_download: bool,
    ) -> Result<ResolvedPackage> {
        // Check if it's a local path
        if source.starts_with("./") || source.starts_with("../") || source.starts_with("/") {
            return self.resolve_local_package(source);
        }

        // It's a registry package
        let registry = registry_url.unwrap_or(&self.config.default_registry);
        let package_spec = parse_package_spec(source)?;

        info!(
            "Resolving package: {} from registry: {}",
            format_package_spec(&package_spec),
            registry
        );

        // Get package information
        let package_info = self.get_package_info(registry, &package_spec).await?;

        // Determine version to use
        let version = determine_version(&package_spec, &package_info)?;

        // Get or create cache directory
        let package_cache_dir = self.get_package_cache_dir(&package_spec, &version)?;

        // Check if package is cached and valid
        let package_dir = if force_download || !is_package_cached(&package_cache_dir)? {
            info!("Downloading package: {}@{}", source, version);
            self.download_and_extract_package(registry, &package_spec, &version, &package_cache_dir)
                .await?
        } else {
            debug!("Using cached package: {}", package_cache_dir.display());
            package_cache_dir
        };

        // Validate package structure
        validate_package_structure(&package_dir)?;

        Ok(ResolvedPackage {
            spec: package_spec,
            version,
            package_dir,
        })
    }

    fn resolve_local_package(&self, source: &str) -> Result<ResolvedPackage> {
        let path = PathBuf::from(source);

        if !path.exists() {
            return Err(anyhow!("Local package path does not exist: {}", source));
        }

        if !path.is_dir() {
            return Err(anyhow!("Local package path is not a directory: {}", source));
        }

        // Validate package structure
        validate_package_structure(&path)?;

        // Extract name from path for spec
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or("local-package")
            .to_string();

        Ok(ResolvedPackage {
            spec: PackageSpec {
                scope: None,
                name,
                version: Some("local".to_string()),
            },
            version: "local".to_string(),
            package_dir: path,
        })
    }

    async fn get_package_info(
        &self,
        registry_url: &str,
        spec: &PackageSpec,
    ) -> Result<PackageInfo> {
        let package_path = if let Some(scope) = &spec.scope {
            format!("{}/{}", scope, spec.name)
        } else {
            spec.name.clone()
        };

        let url = format!("{}/api/v1/registry/packages/{}", registry_url, package_path);
        debug!("Fetching package info from: {}", url);

        let mut request = self.client.get(&url);

        // Add authentication header if available
        if let Some(auth_provider) = &self.auth_provider {
            if let Ok(Some(auth)) = auth_provider.get_auth_for_registry(registry_url) {
                request = request.header(
                    "Authorization",
                    format!("Bearer {}", auth.tokens.access_token),
                );
            }
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

    fn get_package_cache_dir(&self, spec: &PackageSpec, version: &str) -> Result<PathBuf> {
        let package_dir = if let Some(scope) = &spec.scope {
            self.config
                .cache_dir
                .join(scope)
                .join(&spec.name)
                .join(version)
        } else {
            self.config
                .cache_dir
                .join("global")
                .join(&spec.name)
                .join(version)
        };

        fs::create_dir_all(&package_dir)?;
        Ok(package_dir)
    }

    async fn download_and_extract_package(
        &self,
        registry_url: &str,
        spec: &PackageSpec,
        version: &str,
        cache_dir: &Path,
    ) -> Result<PathBuf> {
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

        let mut request = self.client.get(&download_url);

        // Add authentication header if available
        if let Some(auth_provider) = &self.auth_provider {
            if let Ok(Some(auth)) = auth_provider.get_auth_for_registry(registry_url) {
                request = request.header(
                    "Authorization",
                    format!("Bearer {}", auth.tokens.access_token),
                );
            }
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
                        if let Ok(download_response) =
                            serde_json::from_str::<DownloadResponse>(text)
                        {
                            debug!(
                                "Server returned download URL: {}",
                                download_response.download_url
                            );

                            // Download from the actual URL
                            let actual_response = self
                                .client
                                .get(&download_response.download_url)
                                .send()
                                .await?;

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

                            // Extract the actual package data
                            self.extract_package(&actual_package_data, cache_dir)
                                .await?;
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
        self.extract_package(&package_data, cache_dir).await?;
        info!("Package cached to: {}", cache_dir.display());
        Ok(cache_dir.to_path_buf())
    }

    async fn extract_package(&self, package_data: &[u8], cache_dir: &Path) -> Result<()> {
        // Extract to temporary directory first
        let temp_dir = TempDir::new()?;
        let temp_path = temp_dir.path();

        // Extract tar.gz
        let tar_gz = flate2::read::GzDecoder::new(package_data);
        let mut archive = tar::Archive::new(tar_gz);
        println!("Extracting to: {}", temp_path.display());
        archive.unpack(temp_path)?;

        // Move to cache directory
        if cache_dir.exists() {
            fs::remove_dir_all(cache_dir)?;
        }
        fs::create_dir_all(cache_dir.parent().unwrap())?;

        // Copy to cache directory
        copy_dir_recursively(temp_path, cache_dir)?;
        Ok(())
    }
}

pub fn parse_package_spec(package: &str) -> Result<PackageSpec> {
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

pub fn format_package_spec(spec: &PackageSpec) -> String {
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

fn is_package_cached(package_dir: &Path) -> Result<bool> {
    if !package_dir.exists() {
        return Ok(false);
    }

    // Check for required files
    let codemod_yaml = package_dir.join("codemod.yaml");
    let workflow_yaml = package_dir.join("workflow.yaml");

    Ok(codemod_yaml.exists() && workflow_yaml.exists())
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

fn copy_dir_recursively(src: &Path, dst: &Path) -> Result<()> {
    println!(
        "Copying directory recursively from: {} to: {}",
        src.display(),
        dst.display()
    );
    for entry in WalkDir::new(src) {
        let entry = entry?;
        let path = entry.path();
        let relative_path = path.strip_prefix(src).unwrap();
        let dst_path = dst.join(relative_path);
        if entry.file_type().is_dir() {
            fs::create_dir_all(&dst_path)?;
        } else {
            fs::copy(path, &dst_path)?;
        }
    }
    Ok(())
}
