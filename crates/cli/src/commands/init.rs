use anyhow::{anyhow, Result};
use clap::Args;
use console::{style, Emoji};
use inquire::{Confirm, Select, Text};
use log::info;
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command as ProcessCommand;

#[derive(Args, Debug)]
pub struct Command {
    /// Project directory name
    #[arg(value_name = "PATH")]
    path: Option<PathBuf>,

    /// Project name (defaults to directory name)
    #[arg(long)]
    name: Option<String>,

    /// Project type
    #[arg(long)]
    project_type: Option<ProjectType>,

    /// Target language
    #[arg(long)]
    language: Option<String>,

    /// Project description
    #[arg(long)]
    description: Option<String>,

    /// Author name and email
    #[arg(long)]
    author: Option<String>,

    /// License
    #[arg(long)]
    license: Option<String>,

    /// Make package private
    #[arg(long)]
    private: bool,

    /// Overwrite existing files
    #[arg(long)]
    force: bool,

    /// Use defaults without prompts
    #[arg(long)]
    no_interactive: bool,
}

#[derive(clap::ValueEnum, Clone, Debug)]
enum ProjectType {
    /// Shell command workflow codemod
    Shell,
    /// JavaScript ast-grep codemod
    AstGrepJs,
    /// YAML ast-grep codemod
    AstGrepYaml,
}

struct ProjectConfig {
    name: String,
    description: String,
    author: String,
    license: String,
    project_type: ProjectType,
    language: String,
    private: bool,
}

// Template constants using include_str!
const CODEMOD_TEMPLATE: &str = include_str!("../templates/codemod.yaml");
const SHELL_WORKFLOW_TEMPLATE: &str = include_str!("../templates/shell/workflow.yaml");
const JS_ASTGREP_WORKFLOW_TEMPLATE: &str = include_str!("../templates/js-astgrep/workflow.yaml");
const ASTGREP_YAML_WORKFLOW_TEMPLATE: &str =
    include_str!("../templates/astgrep-yaml/workflow.yaml");
const GITIGNORE_TEMPLATE: &str = include_str!("../templates/common/.gitignore");
const README_TEMPLATE: &str = include_str!("../templates/common/README.md");

// Shell project templates
const SHELL_SETUP_SCRIPT: &str = include_str!("../templates/shell/scripts/setup.sh");
const SHELL_TRANSFORM_SCRIPT: &str = include_str!("../templates/shell/scripts/transform.sh");
const SHELL_CLEANUP_SCRIPT: &str = include_str!("../templates/shell/scripts/cleanup.sh");

// JS ast-grep project templates
const JS_PACKAGE_JSON_TEMPLATE: &str = include_str!("../templates/js-astgrep/package.json");
const JS_APPLY_SCRIPT_FOR_JAVASCRIPT: &str =
    include_str!("../templates/js-astgrep/scripts/codemod.js.ts");
const JS_APPLY_SCRIPT_FOR_PYTHON: &str =
    include_str!("../templates/js-astgrep/scripts/codemod.py.ts");
const JS_APPLY_SCRIPT_FOR_RUST: &str =
    include_str!("../templates/js-astgrep/scripts/codemod.rs.ts");
const JS_APPLY_SCRIPT_FOR_GO: &str = include_str!("../templates/js-astgrep/scripts/codemod.go.ts");
const JS_APPLY_SCRIPT_FOR_JAVA: &str =
    include_str!("../templates/js-astgrep/scripts/codemod.java.ts");
const JS_TSCONFIG_TEMPLATE: &str = include_str!("../templates/js-astgrep/tsconfig.json");
const JS_TEST_INPUT: &str = include_str!("../templates/js-astgrep/tests/fixtures/input.js");
const JS_TEST_EXPECTED: &str = include_str!("../templates/js-astgrep/tests/fixtures/expected.js");
// ast-grep YAML project templates
const ASTGREP_PATTERNS_FOR_JAVASCRIPT: &str =
    include_str!("../templates/astgrep-yaml/rules/config.js.yml");
const ASTGREP_PATTERNS_FOR_PYTHON: &str =
    include_str!("../templates/astgrep-yaml/rules/config.py.yml");
const ASTGREP_PATTERNS_FOR_RUST: &str =
    include_str!("../templates/astgrep-yaml/rules/config.rs.yml");
const ASTGREP_PATTERNS_FOR_GO: &str = include_str!("../templates/astgrep-yaml/rules/config.go.yml");
const ASTGREP_PATTERNS_FOR_JAVA: &str =
    include_str!("../templates/astgrep-yaml/rules/config.java.yml");

static ROCKET: Emoji<'_, '_> = Emoji("🚀 ", "");
static CHECKMARK: Emoji<'_, '_> = Emoji("✓ ", "");

pub fn handler(args: &Command) -> Result<()> {
    let (project_path, project_name) = if args.no_interactive {
        let project_path = args
            .path
            .clone()
            .unwrap_or_else(|| PathBuf::from("my-codemod"));

        let project_name = args.name.clone().unwrap_or_else(|| {
            project_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("my-codemod")
                .to_string()
        });

        (project_path, project_name)
    } else {
        // Interactive mode - ask for path if not provided
        let project_path = if let Some(path) = &args.path {
            path.clone()
        } else {
            let path_str = Text::new("Project directory:")
                .with_default("my-codemod")
                .prompt()?;
            PathBuf::from(path_str)
        };

        let project_name = args.name.clone().unwrap_or_else(|| {
            project_path
                .file_name()
                .and_then(|n| n.to_str())
                .unwrap_or("my-codemod")
                .to_string()
        });

        (project_path, project_name)
    };

    if project_path.exists() && !args.force {
        return Err(anyhow!(
            "Directory already exists: {}. Use --force to overwrite.",
            project_path.display()
        ));
    }

    let config = if args.no_interactive {
        ProjectConfig {
            name: project_name,
            description: args
                .description
                .clone()
                .unwrap_or_else(|| "A new codemod".to_string()),
            author: args
                .author
                .clone()
                .unwrap_or_else(|| "Author <author@example.com>".to_string()),
            license: args.license.clone().unwrap_or_else(|| "MIT".to_string()),
            project_type: args.project_type.clone().unwrap_or(ProjectType::Shell),
            language: args
                .language
                .clone()
                .unwrap_or_else(|| "javascript".to_string()),
            private: args.private,
        }
    } else {
        interactive_setup(&project_name, args)?
    };

    create_project(&project_path, &config)?;

    // Run post init commands
    run_post_init_commands(&project_path, &config)?;

    print_next_steps(&project_path, &config)?;

    Ok(())
}

fn interactive_setup(project_name: &str, args: &Command) -> Result<ProjectConfig> {
    println!(
        "{} {}",
        ROCKET,
        style("Creating a new codemod project").bold()
    );
    println!();

    // Project type selection
    let project_type = if let Some(pt) = &args.project_type {
        pt.clone()
    } else {
        select_project_type()?
    };

    // Language selection
    let language = if let Some(lang) = &args.language {
        lang.clone()
    } else {
        select_language()?
    };

    // Project details
    let name = if args.name.is_some() {
        args.name.clone().unwrap()
    } else {
        Text::new("Project name:")
            .with_default(project_name)
            .prompt()?
    };

    let description = if let Some(desc) = &args.description {
        desc.clone()
    } else {
        Text::new("Description:")
            .with_default("Transform legacy code patterns")
            .prompt()?
    };

    let author = if let Some(auth) = &args.author {
        auth.clone()
    } else {
        Text::new("Author:")
            .with_default("Author <author@example.com>")
            .prompt()?
    };

    let license = if let Some(lic) = &args.license {
        lic.clone()
    } else {
        Text::new("License:").with_default("MIT").prompt()?
    };

    let private = if args.private {
        true
    } else {
        Confirm::new("Private package?")
            .with_default(false)
            .prompt()?
    };

    Ok(ProjectConfig {
        name,
        description,
        author,
        license,
        project_type,
        language,
        private,
    })
}

fn select_project_type() -> Result<ProjectType> {
    let options = vec![
        "Shell command workflow codemod",
        "JavaScript ast-grep codemod",
        "YAML ast-grep codemod",
    ];

    let selection =
        Select::new("What type of codemod would you like to create?", options).prompt()?;

    match selection {
        "Shell command workflow codemod" => Ok(ProjectType::Shell),
        "JavaScript ast-grep codemod" => Ok(ProjectType::AstGrepJs),
        "YAML ast-grep codemod" => Ok(ProjectType::AstGrepYaml),
        _ => Ok(ProjectType::Shell), // Default fallback
    }
}

fn select_language() -> Result<String> {
    let options = vec![
        "JavaScript/TypeScript",
        "Python",
        "Rust",
        "Go",
        "Java",
        "Other",
    ];

    let selection = Select::new("Which language would you like to target?", options).prompt()?;

    let language = match selection {
        "JavaScript/TypeScript" => "javascript",
        "Python" => "python",
        "Rust" => "rust",
        "Go" => "go",
        "Java" => "java",
        "Other" => {
            let custom = Text::new("Enter language name:").prompt()?;
            return Ok(custom);
        }
        _ => "javascript",
    };

    Ok(language.to_string())
}

fn create_project(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    // Create project directory
    fs::create_dir_all(project_path)?;

    // Create codemod.yaml
    create_manifest(project_path, config)?;

    // Create workflow.yaml
    create_workflow(project_path, config)?;

    // Create project-specific structure
    match config.project_type {
        ProjectType::Shell => create_shell_project(project_path, config)?,
        ProjectType::AstGrepJs => create_js_astgrep_project(project_path, config)?,
        ProjectType::AstGrepYaml => create_astgrep_yaml_project(project_path, config)?,
    }

    // Create common files
    create_gitignore(project_path)?;
    create_readme(project_path, config)?;

    info!("✓ Created {} project", config.name);
    Ok(())
}

fn create_manifest(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    let manifest_content = CODEMOD_TEMPLATE
        .replace("{name}", &config.name)
        .replace("{description}", &config.description)
        .replace("{author}", &config.author)
        .replace("{license}", &config.license)
        .replace("{language}", &config.language)
        .replace(
            "{access}",
            if config.private { "private" } else { "public" },
        )
        .replace(
            "{visibility}",
            if config.private { "private" } else { "public" },
        );

    fs::write(project_path.join("codemod.yaml"), manifest_content)?;
    Ok(())
}

fn create_workflow(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    let workflow_content = match config.project_type {
        ProjectType::Shell => SHELL_WORKFLOW_TEMPLATE,
        ProjectType::AstGrepJs => JS_ASTGREP_WORKFLOW_TEMPLATE,
        ProjectType::AstGrepYaml => ASTGREP_YAML_WORKFLOW_TEMPLATE,
    };

    fs::write(project_path.join("workflow.yaml"), workflow_content)?;
    Ok(())
}

fn create_shell_project(project_path: &Path, _config: &ProjectConfig) -> Result<()> {
    // Create scripts directory
    let scripts_dir = project_path.join("scripts");
    fs::create_dir_all(&scripts_dir)?;

    // Create setup script
    fs::write(scripts_dir.join("setup.sh"), SHELL_SETUP_SCRIPT)?;

    // Create transform script
    fs::write(scripts_dir.join("transform.sh"), SHELL_TRANSFORM_SCRIPT)?;

    // Create cleanup script
    fs::write(scripts_dir.join("cleanup.sh"), SHELL_CLEANUP_SCRIPT)?;

    Ok(())
}

fn create_js_astgrep_project(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    // Create package.json
    let package_json = JS_PACKAGE_JSON_TEMPLATE
        .replace("{name}", &config.name)
        .replace("{description}", &config.description);

    fs::write(project_path.join("package.json"), package_json)?;

    // Create scripts directory
    let scripts_dir = project_path.join("scripts");
    fs::create_dir_all(&scripts_dir)?;

    let codemod_script = match config.language.as_str() {
        "javascript" => JS_APPLY_SCRIPT_FOR_JAVASCRIPT.to_string(),
        "python" => JS_APPLY_SCRIPT_FOR_PYTHON.to_string(),
        "rust" => JS_APPLY_SCRIPT_FOR_RUST.to_string(),
        "go" => JS_APPLY_SCRIPT_FOR_GO.to_string(),
        "java" => JS_APPLY_SCRIPT_FOR_JAVA.to_string(),
        _ => JS_APPLY_SCRIPT_FOR_JAVASCRIPT.to_string(),
    };
    fs::write(scripts_dir.join("codemod.ts"), codemod_script.as_str())?;

    // Create tsconfig.json
    fs::write(project_path.join("tsconfig.json"), JS_TSCONFIG_TEMPLATE)?;

    // Create tests
    create_js_tests(project_path, config)?;

    Ok(())
}

fn create_astgrep_yaml_project(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    // Create rules directory
    let rules_dir = project_path.join("rules");
    fs::create_dir_all(&rules_dir)?;

    let config_file = match config.language.as_str() {
        "javascript" => ASTGREP_PATTERNS_FOR_JAVASCRIPT,
        "python" => ASTGREP_PATTERNS_FOR_PYTHON,
        "rust" => ASTGREP_PATTERNS_FOR_RUST,
        "go" => ASTGREP_PATTERNS_FOR_GO,
        "java" => ASTGREP_PATTERNS_FOR_JAVA,
        _ => ASTGREP_PATTERNS_FOR_JAVASCRIPT,
    };
    fs::write(rules_dir.join("config.yml"), config_file)?;

    // Create tests directory
    let tests_dir = project_path.join("tests");
    fs::create_dir_all(tests_dir.join("input"))?;
    fs::create_dir_all(tests_dir.join("expected"))?;

    Ok(())
}

fn create_js_tests(project_path: &Path, _config: &ProjectConfig) -> Result<()> {
    let tests_dir = project_path.join("tests");
    fs::create_dir_all(tests_dir.join("fixtures"))?;

    fs::write(tests_dir.join("fixtures").join("input.js"), JS_TEST_INPUT)?;
    fs::write(
        tests_dir.join("fixtures").join("expected.js"),
        JS_TEST_EXPECTED,
    )?;

    Ok(())
}

fn create_gitignore(project_path: &Path) -> Result<()> {
    fs::write(project_path.join(".gitignore"), GITIGNORE_TEMPLATE)?;
    Ok(())
}

fn create_readme(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    let test_command = match config.project_type {
        ProjectType::Shell => "bash scripts/transform.sh",
        ProjectType::AstGrepJs => "npm test",
        ProjectType::AstGrepYaml => "ast-grep test rules/",
    };

    let readme_content = README_TEMPLATE
        .replace("{name}", &config.name)
        .replace("{description}", &config.description)
        .replace("{language}", &config.language)
        .replace("{test_command}", test_command)
        .replace("{license}", &config.license);

    fs::write(project_path.join("README.md"), readme_content)?;
    Ok(())
}

fn run_post_init_commands(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    match config.project_type {
        ProjectType::AstGrepJs => {
            let package_manager = Select::new(
                "Which package manager would you like to use?",
                vec!["npm", "yarn", "pnpm"],
            )
            .prompt()?;

            let output = ProcessCommand::new(package_manager)
                .arg("install")
                .current_dir(project_path)
                .output();

            println!("{} Installing dependencies...", style("⏳").yellow());

            match output {
                Ok(result) => {
                    if result.status.success() {
                        println!("{CHECKMARK} Dependencies installed successfully");
                    } else {
                        let stderr = String::from_utf8_lossy(&result.stderr);
                        println!(
                            "{} Failed to install dependencies: {}",
                            style("⚠").red(),
                            stderr
                        );
                        println!(
                            "  You can run {} manually later",
                            style("npm install").cyan()
                        );
                    }
                }
                Err(e) => {
                    println!("{} npm not found: {}", style("⚠").red(), e);
                    println!(
                        "  You can run {} manually later",
                        style("npm install").cyan()
                    );
                }
            }
        }
        ProjectType::Shell => {
            println!("{} Making scripts executable...", style("⏳").yellow());

            let scripts_dir = project_path.join("scripts");
            if let Ok(entries) = fs::read_dir(&scripts_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    if path.extension().and_then(|s| s.to_str()) == Some("sh") {
                        #[cfg(unix)]
                        {
                            use std::os::unix::fs::PermissionsExt;
                            if let Ok(mut perms) = fs::metadata(&path).map(|m| m.permissions()) {
                                perms.set_mode(0o755);
                                if fs::set_permissions(&path, perms).is_ok() {
                                    println!(
                                        "{} Made {} executable",
                                        CHECKMARK,
                                        path.file_name().unwrap().to_string_lossy()
                                    );
                                }
                            }
                        }
                        #[cfg(not(unix))]
                        {
                            println!(
                                "{} {} (executable permission not set on non-Unix systems)",
                                CHECKMARK,
                                path.file_name().unwrap().to_string_lossy()
                            );
                        }
                    }
                }
            }
        }
        ProjectType::AstGrepYaml => {
            // No post-init commands needed for YAML projects
        }
    }

    Ok(())
}

fn print_next_steps(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    println!();
    println!(
        "{} Created {} project",
        CHECKMARK,
        style(&config.name).green().bold()
    );
    println!("{CHECKMARK} Generated codemod.yaml manifest");
    println!("{CHECKMARK} Generated workflow.yaml definition");
    println!("{CHECKMARK} Created project structure");
    println!();
    println!("{}", style("Next steps:").bold());
    println!(
        "  {}",
        style(format!("cd {}", project_path.display())).cyan()
    );

    println!();
    println!("  {}", style("# Validate your workflow").dim());
    println!("  {}", style("codemod validate -w workflow.yaml").cyan());
    println!();
    println!("  {}", style("# Run your codemod").dim());
    println!("  {}", style("codemod run -w .").cyan());
    println!();
    println!("  {}", style("# Publish when ready").dim());
    println!("  {}", style("codemod login").cyan());
    println!("  {}", style("codemod publish").cyan());

    Ok(())
}
