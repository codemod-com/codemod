use std::collections::HashMap;
use std::process::Command;

use async_trait::async_trait;

use butterflow_models::Error;
use butterflow_models::Result;

use crate::Runner;

/// Direct runner (runs commands directly on the host)
pub struct DirectRunner;

impl DirectRunner {
    /// Create a new direct runner
    pub fn new() -> Self {
        Self
    }
}

impl Default for DirectRunner {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl Runner for DirectRunner {
    async fn run_command(&self, command: &str, env: &HashMap<String, String>) -> Result<String> {
        // Check if the command starts with a shebang line
        if command.starts_with("#!/") {
            // Create a temporary file for the script
            let temp_dir = std::env::temp_dir();
            let file_name = format!("butterflow-script-{}.sh", uuid::Uuid::new_v4());
            let script_path = temp_dir.join(file_name);

            // Write the script to the temporary file
            std::fs::write(&script_path, command).map_err(|e| {
                Error::Runtime(format!("Failed to write script to temporary file: {e}"))
            })?;

            // Make the script executable
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;
                let mut perms = std::fs::metadata(&script_path)
                    .map_err(|e| Error::Runtime(format!("Failed to get file permissions: {e}")))?
                    .permissions();
                perms.set_mode(0o755);
                std::fs::set_permissions(&script_path, perms)
                    .map_err(|e| Error::Runtime(format!("Failed to set file permissions: {e}")))?;
            }

            // Create the command
            let mut cmd = Command::new(&script_path);

            // Add environment variables
            for (key, value) in env {
                cmd.env(key, value);
            }

            // Execute the command
            let output = cmd
                .output()
                .map_err(|e| Error::Runtime(format!("Failed to execute command: {e}")))?;

            // Clean up the temporary file
            std::fs::remove_file(&script_path).ok();

            // Check if the command succeeded
            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(Error::Runtime(format!(
                    "Command failed with exit code {}: {}",
                    output.status.code().unwrap_or(-1),
                    stderr
                )));
            }

            // Return the output
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            Ok(stdout)
        } else {
            // Determine the shell to use
            let shell = if cfg!(target_os = "windows") {
                "cmd"
            } else {
                "sh"
            };

            let shell_arg = if cfg!(target_os = "windows") {
                "/C"
            } else {
                "-c"
            };

            // Create the command
            let mut cmd = Command::new(shell);
            cmd.arg(shell_arg).arg(command);

            // Add environment variables
            for (key, value) in env {
                cmd.env(key, value);
            }

            // Execute the command
            let output = cmd
                .output()
                .map_err(|e| Error::Runtime(format!("Failed to execute command: {e}")))?;

            // Check if the command succeeded
            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(Error::Runtime(format!(
                    "Command failed with exit code {}: {}",
                    output.status.code().unwrap_or(-1),
                    stderr
                )));
            }

            // Return the output
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            Ok(stdout)
        }
    }
}
