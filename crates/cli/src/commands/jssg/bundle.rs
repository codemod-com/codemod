use anyhow::Result;
use clap::Parser;
use codemod_sandbox::utils::{
    bundler::{Bundler, BundlerConfig, RuntimeSystem},
    project_discovery::find_tsconfig,
};
use std::path::PathBuf;

#[derive(Parser, Debug, Clone)]
pub struct Command {
    /// Path to the entry JavaScript/TypeScript file to bundle
    pub entry_path: PathBuf,

    /// Path to tsconfig.json file (optional, will be auto-discovered if not provided)
    #[arg(long)]
    pub tsconfig: Option<PathBuf>,

    /// Output file path for the bundle (optional, defaults to stdout)
    #[arg(long, short)]
    pub output: Option<PathBuf>,

    /// Base directory for module resolution (defaults to entry file's directory)
    #[arg(long)]
    pub base_dir: Option<PathBuf>,

    /// Runtime module system to use
    #[arg(long, value_enum, default_value = "commonjs")]
    pub runtime: RuntimeSystemArg,

    /// Enable source maps
    #[arg(long)]
    pub source_maps: bool,

    /// Verbose output
    #[arg(long, short)]
    pub verbose: bool,
}

#[derive(clap::ValueEnum, Clone, Debug, PartialEq)]
pub enum RuntimeSystemArg {
    /// CommonJS module system (module.exports/require)
    Commonjs,
    /// Custom lightweight runtime system
    Custom,
}

impl From<RuntimeSystemArg> for RuntimeSystem {
    fn from(arg: RuntimeSystemArg) -> Self {
        match arg {
            RuntimeSystemArg::Commonjs => RuntimeSystem::CommonJS,
            RuntimeSystemArg::Custom => RuntimeSystem::Custom,
        }
    }
}

impl Command {
    pub async fn run(self) -> Result<()> {
        let entry_path = self.entry_path.canonicalize().map_err(|e| {
            anyhow::anyhow!(
                "Failed to resolve entry path '{}': {}",
                self.entry_path.display(),
                e
            )
        })?;

        if self.verbose {
            eprintln!("📦 Bundling entry point: {}", entry_path.display());
        }

        // Determine base directory
        let base_dir = if let Some(base_dir) = self.base_dir {
            base_dir.canonicalize().map_err(|e| {
                anyhow::anyhow!(
                    "Failed to resolve base directory '{}': {}",
                    base_dir.display(),
                    e
                )
            })?
        } else {
            entry_path
                .parent()
                .ok_or_else(|| anyhow::anyhow!("Entry path has no parent directory"))?
                .to_path_buf()
        };

        if self.verbose {
            eprintln!("📁 Base directory: {}", base_dir.display());
        }

        // Determine tsconfig path
        let tsconfig_path = if let Some(tsconfig) = self.tsconfig {
            let resolved = tsconfig.canonicalize().map_err(|e| {
                anyhow::anyhow!(
                    "Failed to resolve tsconfig path '{}': {}",
                    tsconfig.display(),
                    e
                )
            })?;
            if self.verbose {
                eprintln!("⚙️  Using provided tsconfig: {}", resolved.display());
            }
            Some(resolved)
        } else {
            // Auto-discover tsconfig.json
            let discovered = find_tsconfig(&base_dir);
            if let Some(ref path) = discovered {
                if self.verbose {
                    eprintln!("⚙️  Auto-discovered tsconfig: {}", path.display());
                }
            } else if self.verbose {
                eprintln!(
                    "⚙️  No tsconfig.json found, proceeding without TypeScript configuration"
                );
            }
            discovered
        };

        // Configure bundler
        let config = BundlerConfig {
            base_dir: base_dir.clone(),
            tsconfig_path,
            runtime_system: self.runtime.into(),
            source_maps: self.source_maps,
        };

        if self.verbose {
            eprintln!("🔧 Runtime system: {:?}", config.runtime_system);
            eprintln!("🗺️  Source maps: {}", config.source_maps);
        }

        // Create bundler
        let mut bundler =
            Bundler::new(config).map_err(|e| anyhow::anyhow!("Failed to create bundler: {}", e))?;

        // Bundle the entry file
        let result = bundler
            .bundle(entry_path.to_str().unwrap())
            .map_err(|e| anyhow::anyhow!("Bundling failed: {}", e))?;

        if self.verbose {
            eprintln!("✅ Bundle created successfully!");
            eprintln!("   📊 Modules bundled: {}", result.modules.len());
            eprintln!("   📏 Bundle size: {} bytes", result.code.len());

            // List bundled modules
            eprintln!("\n📋 Bundled modules:");
            for module in &result.modules {
                eprintln!("   • {}", module.id);
                if !module.dependencies.is_empty() && self.verbose {
                    eprintln!("     └─ Dependencies: {:?}", module.dependencies);
                }
            }
            eprintln!();
        }

        // Output the bundle
        if let Some(output_path) = self.output {
            std::fs::write(&output_path, &result.code).map_err(|e| {
                anyhow::anyhow!(
                    "Failed to write bundle to '{}': {}",
                    output_path.display(),
                    e
                )
            })?;

            if self.verbose {
                eprintln!("💾 Bundle written to: {}", output_path.display());
            }
        } else {
            // Output to stdout
            println!("{}", result.code);
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[tokio::test]
    async fn test_bundle_command_creation() {
        let temp_dir = TempDir::new().unwrap();
        let entry_path = temp_dir.path().join("index.js");
        fs::write(&entry_path, "console.log('Hello, world!');").unwrap();

        let command = Command {
            entry_path: entry_path.clone(),
            tsconfig: None,
            output: None,
            base_dir: None,
            runtime: RuntimeSystemArg::Commonjs,
            source_maps: false,
            verbose: false,
        };

        // Should not panic when creating the command
        assert_eq!(command.entry_path, entry_path);
        assert_eq!(command.runtime, RuntimeSystemArg::Commonjs);
        assert!(!command.source_maps);
    }

    #[test]
    fn test_runtime_system_conversion() {
        assert!(matches!(
            RuntimeSystem::from(RuntimeSystemArg::Commonjs),
            RuntimeSystem::CommonJS
        ));
        assert!(matches!(
            RuntimeSystem::from(RuntimeSystemArg::Custom),
            RuntimeSystem::Custom
        ));
    }
}
