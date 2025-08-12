use ignore::{
    overrides::{Override, OverrideBuilder},
    WalkBuilder,
};
use std::{
    path::{Path, PathBuf},
    sync::Arc,
};

#[derive(Clone)]
pub struct PreRunCallback {
    pub callback: Arc<Box<dyn Fn(&Path, bool) + Send + Sync>>,
}

#[derive(Clone)]
pub struct ProgressCallback {
    pub callback: Arc<Box<dyn Fn(&str, &str, &str, Option<&u64>, &u64) + Send + Sync>>,
}

pub struct FileCallback {
    pub callback: Box<dyn Fn(&Path, &CodemodExecutionConfig) + Send + Sync>,
}

pub struct CodemodExecutionConfig {
    /// Callback to run before the codemod execution
    pub pre_run_callback: Option<PreRunCallback>,
    /// Callback to report progress
    pub progress_callback: Arc<Option<ProgressCallback>>,
    /// Path to the target file or directory
    pub target_path: Option<PathBuf>,
    /// Path to the base directory relative to the target path
    pub base_path: Option<PathBuf>,
    /// Globs to include
    pub include_globs: Option<Vec<String>>,
    /// Globs to exclude
    pub exclude_globs: Option<Vec<String>>,
    /// Dry run mode
    pub dry_run: bool,
}

impl CodemodExecutionConfig {
    /// Execute the codemod by iterating through files and calling the provided callback
    pub fn execute<F>(&self, callback: F) -> Result<(), String>
    where
        F: Fn(&Path, &CodemodExecutionConfig) + Send + Sync,
    {
        // Determine the search base path
        let search_base = self.get_search_base()?;

        // Call pre-run callback if provided
        if let Some(ref pre_run_cb) = self.pre_run_callback {
            (pre_run_cb.callback)(&search_base, !self.dry_run);
        }

        // Build glob overrides
        let globs = self.build_globs(&search_base)?;

        // Create WalkBuilder with the same configuration as native.rs
        let walker = WalkBuilder::new(&search_base)
            .follow_links(false)
            .git_ignore(true)
            .ignore(true)
            .hidden(false)
            .overrides(globs)
            .build();

        // Collect all entries first to get count for progress reporting
        let walker_entries: Vec<_> = walker.collect();
        let walker_count = walker_entries.len();

        // Iterate through all files
        for (index, entry) in walker_entries.into_iter().enumerate() {
            let entry = entry.map_err(|e| format!("Walk error: {}", e))?;
            let file_path = entry.path();

            // Report progress if callback is provided
            if let Some(ref progress_cb) = self.progress_callback.as_ref() {
                let file_name = file_path.file_name().unwrap_or_default().to_string_lossy();
                (progress_cb.callback)(
                    "",
                    &file_name,
                    "processing",
                    Some(&(walker_count as u64)),
                    &(index as u64),
                );
            }

            // Only process files, not directories
            if entry.file_type().is_some_and(|ft| ft.is_file()) {
                callback(file_path, self);
            }
        }

        Ok(())
    }

    /// Get the search base path by combining target_path and base_path
    fn get_search_base(&self) -> Result<PathBuf, String> {
        let target = self
            .target_path
            .as_ref()
            .ok_or_else(|| "target_path is required".to_string())?;

        if let Some(base) = &self.base_path {
            // If base_path is provided, combine it with target_path
            if base.is_absolute() {
                Err(format!("base_path is absolute: {}", base.display()))
            } else {
                Ok(target.join(base))
            }
        } else {
            // Use target_path as the search base
            Ok(target.clone())
        }
    }

    /// Build glob overrides for include/exclude patterns
    fn build_globs(&self, base_path: &Path) -> Result<Override, String> {
        let mut builder = OverrideBuilder::new(base_path);

        // Add include patterns
        if let Some(ref include_globs) = self.include_globs {
            for glob in include_globs {
                builder
                    .add(glob)
                    .map_err(|e| format!("Invalid include glob '{}': {}", glob, e))?;
            }
        } else {
            // If no include patterns, default to all files
            builder
                .add("**/*")
                .map_err(|e| format!("Failed to add default include pattern: {}", e))?;
        }

        // Add exclude patterns (prefixed with !)
        if let Some(ref exclude_globs) = self.exclude_globs {
            for glob in exclude_globs {
                let exclude_pattern = if glob.starts_with('!') {
                    glob.to_string()
                } else {
                    format!("!{}", glob)
                };
                builder
                    .add(&exclude_pattern)
                    .map_err(|e| format!("Invalid exclude glob '{}': {}", exclude_pattern, e))?;
            }
        }

        builder
            .build()
            .map_err(|e| format!("Failed to build glob overrides: {}", e))
    }
}
