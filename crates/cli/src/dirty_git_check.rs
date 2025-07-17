use anyhow::Result;
use inquire::Confirm;
use std::path::Path;
use std::process::Command;

pub fn dirty_check(allow_dirty: bool) -> Result<()> {
    if !allow_dirty
        && Command::new("git").arg("--version").output().is_ok()
        && Path::new(".git").exists()
    {
        let output = Command::new("git")
            .args(["status", "--porcelain"])
            .output()
            .expect("Failed to run git");

        if !output.stdout.is_empty()
            && !String::from_utf8_lossy(&output.stdout)
                .contains("nothing to commit, working tree clean")
        {
            let answer =
                Confirm::new("⚠️  You have uncommitted changes. Do you want to continue anyway?")
                    .with_default(false)
                    .with_help_message("Press 'y' to continue or 'n' to abort")
                    .prompt()?;

            if !answer {
                return Err(anyhow::anyhow!("Aborting due to uncommitted changes"));
            }
        }
    }

    Ok(())
}
