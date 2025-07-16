use std::io::{self, Write};

use anyhow::Result;
use std::process::Command as ProcessCommand;

pub fn dirt_check(allow_dirty: bool) -> Result<()> {
    if !allow_dirty {
        let output = ProcessCommand::new("git")
            .args(["status", "--porcelain"])
            .output()
            .expect("Failed to run git");

        if !output.stdout.is_empty()
            && !String::from_utf8_lossy(&output.stdout)
                .contains("nothing to commit, working tree clean")
        {
            print!("⚠️  You have uncommitted changes. Do you want to continue anyway? [y/N]: ");
            io::stdout().flush().unwrap();
            let mut answer = String::new();
            io::stdin().read_line(&mut answer).unwrap();
            if !matches!(answer.trim().to_lowercase().as_str(), "y" | "yes") {
                return Err(anyhow::anyhow!("Aborting due to uncommitted changes"));
            }
        }
    }

    Ok(())
}
