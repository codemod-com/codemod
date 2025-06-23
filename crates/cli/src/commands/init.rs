use anyhow::{anyhow, Result};
use clap::Args;
use log::info;
use std::fs;
use std::io::{self, Write};
use std::path::{Path, PathBuf};

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
    /// JavaScript AST-grep codemod
    JsAstgrep,
    /// AST-grep YAML codemod
    AstgrepYaml,
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

// JS AST-grep project templates
const JS_PACKAGE_JSON_TEMPLATE: &str = include_str!("../templates/js-astgrep/package.json");
const JS_APPLY_SCRIPT: &str = include_str!("../templates/js-astgrep/scripts/codemod.ts");
const JS_TEST_INPUT: &str = include_str!("../templates/js-astgrep/tests/fixtures/input.js");
const JS_TEST_EXPECTED: &str = include_str!("../templates/js-astgrep/tests/fixtures/expected.js");
// AST-grep YAML project templates
const ASTGREP_PATTERNS: &str = include_str!("../templates/astgrep-yaml/rules/config.yml");

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
            let path_str = prompt_with_default("Project directory", "my-codemod")?;
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
    print_next_steps(&project_path, &config)?;

    Ok(())
}

fn interactive_setup(project_name: &str, args: &Command) -> Result<ProjectConfig> {
    println!("🚀 Creating a new codemod project");
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
        select_language(&project_type)?
    };

    // Project details
    let name = prompt_with_default("Project name", project_name)?;
    let description = if let Some(desc) = &args.description {
        desc.clone()
    } else {
        prompt_with_default("Description", "Transform legacy code patterns")?
    };

    let author = if let Some(auth) = &args.author {
        auth.clone()
    } else {
        prompt_with_default("Author", "Author <author@example.com>")?
    };

    let license = if let Some(lic) = &args.license {
        lic.clone()
    } else {
        prompt_with_default("License", "MIT")?
    };

    let private = args.private || prompt_yes_no("Private package?", false)?;

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
    println!("? What type of codemod would you like to create?");
    println!("  1) Shell command workflow codemod");
    println!("  2) JavaScript AST-grep codemod");
    println!("  3) AST-grep YAML codemod");
    print!("> ");
    io::stdout().flush()?;

    let mut input = String::new();
    io::stdin().read_line(&mut input)?;

    match input.trim() {
        "1" => Ok(ProjectType::Shell),
        "2" => Ok(ProjectType::JsAstgrep),
        "3" => Ok(ProjectType::AstgrepYaml),
        "" => Ok(ProjectType::Shell), // Default
        _ => {
            println!("Invalid selection, using Shell workflow");
            Ok(ProjectType::Shell)
        }
    }
}

fn select_language(project_type: &ProjectType) -> Result<String> {
    match project_type {
        ProjectType::Shell => {
            println!("? Which language would you like to target?");
            println!("  1) JavaScript/TypeScript");
            println!("  2) Python");
            println!("  3) Rust");
            println!("  4) Go");
            println!("  5) Java");
            println!("  6) Other");
            print!("> ");
            io::stdout().flush()?;

            let mut input = String::new();
            io::stdin().read_line(&mut input)?;

            let language = match input.trim() {
                "1" | "" => "javascript",
                "2" => "python",
                "3" => "rust",
                "4" => "go",
                "5" => "java",
                "6" => {
                    print!("Enter language name: ");
                    io::stdout().flush()?;
                    let mut custom = String::new();
                    io::stdin().read_line(&mut custom)?;
                    return Ok(custom.trim().to_string());
                }
                _ => "javascript",
            };

            Ok(language.to_string())
        }
        ProjectType::JsAstgrep | ProjectType::AstgrepYaml => {
            Ok("javascript".to_string()) // Default for AST-grep projects
        }
    }
}

fn prompt_with_default(prompt: &str, default: &str) -> Result<String> {
    print!("? {} ({}): ", prompt, default);
    io::stdout().flush()?;

    let mut input = String::new();
    io::stdin().read_line(&mut input)?;

    let value = input.trim();
    if value.is_empty() {
        Ok(default.to_string())
    } else {
        Ok(value.to_string())
    }
}

fn prompt_yes_no(prompt: &str, default: bool) -> Result<bool> {
    let default_str = if default { "Y/n" } else { "y/N" };
    print!("? {} ({}): ", prompt, default_str);
    io::stdout().flush()?;

    let mut input = String::new();
    io::stdin().read_line(&mut input)?;

    match input.trim().to_lowercase().as_str() {
        "y" | "yes" => Ok(true),
        "n" | "no" => Ok(false),
        "" => Ok(default),
        _ => Ok(default),
    }
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
        ProjectType::JsAstgrep => create_js_astgrep_project(project_path, config)?,
        ProjectType::AstgrepYaml => create_astgrep_yaml_project(project_path, config)?,
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
        ProjectType::JsAstgrep => JS_ASTGREP_WORKFLOW_TEMPLATE,
        ProjectType::AstgrepYaml => ASTGREP_YAML_WORKFLOW_TEMPLATE,
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

    fs::write(scripts_dir.join("codemod.ts"), JS_APPLY_SCRIPT)?;

    // Create tests
    create_js_tests(project_path, config)?;

    Ok(())
}

fn create_astgrep_yaml_project(project_path: &Path, _config: &ProjectConfig) -> Result<()> {
    // Create rules directory
    let rules_dir = project_path.join("rules");
    fs::create_dir_all(&rules_dir)?;

    fs::write(rules_dir.join("config.yml"), ASTGREP_PATTERNS)?;

    // Create scripts directory
    let scripts_dir = project_path.join("scripts");
    fs::create_dir_all(&scripts_dir)?;

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
        ProjectType::JsAstgrep => "npm test",
        ProjectType::AstgrepYaml => "ast-grep test rules/",
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

fn print_next_steps(project_path: &Path, config: &ProjectConfig) -> Result<()> {
    println!();
    println!("✓ Created {} project", config.name);
    println!("✓ Generated codemod.yaml manifest");
    println!("✓ Generated workflow.yaml definition");
    println!("✓ Created project structure");
    println!();
    println!("Next steps:");
    println!("  cd {}", project_path.display());

    match config.project_type {
        ProjectType::JsAstgrep => {
            println!("  npm install");
            println!();
            println!("  # Test your codemod");
            println!("  npm test");
        }
        ProjectType::Shell => {
            println!("  # Make scripts executable");
            println!("  chmod +x scripts/*.sh");
            println!();
            println!("  # Test your codemod");
            println!("  bash scripts/transform.sh");
        }
        ProjectType::AstgrepYaml => {
            println!("  # Test your rules");
            println!("  ast-grep test rules/");
        }
    }

    println!();
    println!("  # Validate your workflow");
    println!("  codemod validate -w workflow.yaml");
    println!();
    println!("  # Run your codemod");
    println!("  codemod run -w workflow.yaml");
    println!();
    println!("  # Publish when ready");
    println!("  codemod login");
    println!("  codemod publish");

    Ok(())
}
