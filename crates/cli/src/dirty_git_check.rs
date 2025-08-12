use anyhow::Result;
use inquire::Confirm;
use std::path::Path;
use std::process::Command;
use std::sync::{Arc, Mutex};

type GitDirtyCheckCallback = Arc<Box<dyn Fn(&Path, bool) + Send + Sync>>;

fn ask_for_git_init(path: &Path) -> Result<bool> {
    let answer = Confirm::new(&format!(
        "⚠️  The target path '{}' is not tracked by Git. Do you want to continue?",
        path.display()
    ))
    .with_default(false)
    .with_help_message("Press 'y' to continue or 'n' to abort")
    .prompt()?;

    Ok(answer)
}

pub fn dirty_check() -> GitDirtyCheckCallback {
    let paths = Arc::new(Mutex::new(vec![]));

    Arc::new(Box::new(move |path: &Path, allow_dirty: bool| {
        let mut paths = paths.lock().unwrap();
        if !paths.contains(&path.to_path_buf()) {
            paths.push(path.to_path_buf());

            if !allow_dirty && Command::new("git").arg("--version").output().is_ok() {
                let output = Command::new("git")
                    .args(["rev-parse", "--is-inside-work-tree"])
                    .current_dir(path)
                    .output();

                match output {
                    Ok(output) if output.status.success() => {
                        let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
                        if result == "true" || Path::new(".git").exists() {
                            let output = Command::new("git")
                                .args(["status", "--porcelain"])
                                .current_dir(path)
                                .output()
                                .expect("Failed to run git");

                            if !output.stdout.is_empty() {
                                let answer = Confirm::new(
                                    &format!(
                                        "⚠️  You have uncommitted changes in this path {}. Do you want to continue anyway?",
                                        path.display()
                                    ),
                                )
                                .with_default(false)
                                .with_help_message("Press 'y' to continue or 'n' to abort")
                                .prompt();

                                if answer.is_err() || !answer.unwrap() {
                                    eprintln!("Error: Aborting due to uncommitted changes");
                                    std::process::exit(1);
                                }
                            }
                        } else if !ask_for_git_init(path).unwrap_or(false) {
                            eprintln!("Error: Aborting due to uninitialized Git repository");
                            std::process::exit(1);
                        }
                    }
                    _ => {
                        if !ask_for_git_init(path).unwrap_or(false) {
                            eprintln!("Error: Aborting due to uninitialized Git repository");
                            std::process::exit(1);
                        }
                    }
                }
            }
        }
    }))
}
