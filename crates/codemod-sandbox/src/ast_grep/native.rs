use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;

use crate::sandbox::engine::language_data::get_extensions_for_language;
use crate::tree_sitter::{load_tree_sitter, SupportedLanguage};
use ast_grep_config::{from_yaml_string, CombinedScan, RuleConfig};
use ast_grep_core::tree_sitter::StrDoc;
use ast_grep_core::AstGrep;
use ast_grep_dynamic::{DynamicLang, Registration};
use dirs::data_local_dir;
use futures::future::join_all;
use ignore::{
    overrides::{Override, OverrideBuilder},
    WalkBuilder,
};
use serde::Deserialize;
use serde_json;
use std::{env, fmt};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AstGrepError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("YAML error: {0}")]
    Yaml(#[from] serde_yaml::Error),
    #[error("Language error: {0}")]
    Language(String),
    #[error("Config error: {0}")]
    Config(String),
    #[error("Path error: {0}")]
    Path(String),
    #[error("Glob error: {0}")]
    Glob(String),
}

#[derive(Debug, Clone)]
pub struct AstGrepMatch {
    pub file_path: String,
    pub start_byte: usize,
    pub end_byte: usize,
    pub start_line: usize,
    pub start_column: usize,
    pub end_line: usize,
    pub end_column: usize,
    pub match_text: String,
    pub rule_id: String,
}

/// Execute ast-grep using include/exclude globs with the given config file
///
/// # Arguments
/// * `include_globs` - Optional include glob patterns for files to search (None means auto-infer from rule languages)
/// * `exclude_globs` - Optional exclude glob patterns for files to skip
/// * `base_path` - Optional base path for resolving relative globs (defaults to current working directory)
/// * `config_file` - Path to the ast-grep configuration file (.yaml or .json)
/// * `working_dir` - Optional working directory to resolve config file path
///
/// # Returns
/// Vector of matches found across all files
pub async fn execute_ast_grep_on_globs(
    include_globs: Option<&[String]>,
    exclude_globs: Option<&[String]>,
    base_path: Option<&str>,
    config_file: &str,
    working_dir: Option<&Path>,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    execute_ast_grep_on_globs_with_options(
        include_globs,
        exclude_globs,
        base_path,
        config_file,
        working_dir,
        false,
    )
    .await
}

/// Execute ast-grep on the given globs with option to apply fixes
pub async fn execute_ast_grep_on_globs_with_fixes(
    include_globs: Option<&[String]>,
    exclude_globs: Option<&[String]>,
    base_path: Option<&str>,
    config_file: &str,
    working_dir: Option<&Path>,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    execute_ast_grep_on_globs_with_options(
        include_globs,
        exclude_globs,
        base_path,
        config_file,
        working_dir,
        true,
    )
    .await
}

#[derive(Debug, Deserialize)]
struct Rule {
    language: String,
}

async fn execute_ast_grep_on_globs_with_options(
    include_globs: Option<&[String]>,
    exclude_globs: Option<&[String]>,
    base_path: Option<&str>,
    config_file: &str,
    working_dir: Option<&Path>,
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    // Resolve config file path
    let config_path = if let Some(wd) = working_dir {
        wd.join(config_file)
    } else {
        PathBuf::from(config_file)
    };

    // Read and parse config file using ast-grep's standard approach
    let config_content = fs::read_to_string(&config_path)?;
    let rule_configs = if config_path
        .extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| ext.to_lowercase())
        == Some("json".to_string())
    {
        // For JSON files, parse as array and convert each rule
        let json_rules: Vec<serde_json::Value> = serde_json::from_str(&config_content)?;
        let mut configs = Vec::new();
        for rule_value in json_rules {
            let yaml_string = serde_yaml::to_string(&rule_value).map_err(|e| {
                AstGrepError::Config(format!("Failed to convert JSON to YAML: {e}"))
            })?;
            let mut rules = from_yaml_string::<DynamicLang>(&yaml_string, &Default::default())
                .map_err(|e| AstGrepError::Config(format!("Failed to parse rule: {e:?}")))?;
            configs.append(&mut rules);
        }
        configs
    } else {
        println!("config_content: {:?}", config_content.split("---").count());
        let splits = config_content.split("---");
        let futures = splits.map(|content| async move {
            let parsed = serde_yaml::Deserializer::from_str(&content).into_iter();
            println!("parsed:");
            let rule = Rule::deserialize(parsed)
                .map_err(|e| AstGrepError::Config(format!("Failed to parse rule: {e:?}")));
            println!("rule: {:?}", rule);

            if let Ok(rule) = rule {
                println!(
                    "if {}",
                    !DynamicLang::all_langs()
                        .iter()
                        .any(|lang| lang.name() == rule.language)
                );
                println!(
                    "DynamicLang::all_langs(): {:?}",
                    DynamicLang::all_langs()
                        .iter()
                        .map(|lang| lang.name())
                        .collect::<Vec<_>>()
                );
                if !DynamicLang::all_langs()
                    .iter()
                    .any(|lang| lang.name() == rule.language)
                {
                    println!("loading tree-sitter language: {:?}", rule.language);
                    let _ = load_tree_sitter(&SupportedLanguage::from_str(&rule.language).unwrap())
                        .await
                        .map_err(|e| {
                            AstGrepError::Config(format!(
                                "Failed to load tree-sitter language: {e:?}"
                            ))
                        });
                } else {
                    println!("language already loaded: {:?}", rule.language);
                }
            }
        });

        join_all(futures).await;

        println!(
            "DynamicLang::all_langs(): {:?}",
            DynamicLang::all_langs()
                .iter()
                .map(|lang| lang.name())
                .collect::<Vec<_>>()
        );
        from_yaml_string::<DynamicLang>(&config_content, &Default::default())
            .map_err(|e| AstGrepError::Config(format!("Failed to parse YAML rules: {e:?}")))?
    };

    if rule_configs.is_empty() {
        return Ok(Vec::new());
    }

    // Extract languages from rules and get their extensions
    let mut rule_languages = std::collections::HashSet::new();
    for rule in &rule_configs {
        rule_languages.insert(rule.language);
    }

    // Get extensions for all rule languages
    let mut applicable_extensions: std::collections::HashSet<String> =
        std::collections::HashSet::new();
    for lang in &rule_languages {
        let extensions = get_extensions_for_language(lang.name());
        for ext in extensions {
            // Convert .ext to *.ext glob pattern
            if ext.starts_with('.') {
                applicable_extensions.insert(format!("*{ext}"));
            } else {
                applicable_extensions.insert(format!("*.{ext}"));
            }
        }
    }

    // Enhance include globs with language-specific extensions if needed
    let enhanced_include_globs = if let Some(globs) = include_globs {
        if globs.is_empty() {
            // If empty array provided, use all applicable extensions
            applicable_extensions.into_iter().collect::<Vec<_>>()
        } else {
            // Check if include patterns are very generic (like **, *.*, etc.)
            // and enhance them with language-specific extensions
            let mut enhanced = Vec::new();
            for glob in globs {
                if is_generic_glob_pattern(glob) {
                    // For generic patterns, add language-specific variants
                    for ext_pattern in &applicable_extensions {
                        if glob == "**" {
                            enhanced.push(format!("**/{ext_pattern}"));
                        } else if glob == "*" {
                            enhanced.push(ext_pattern.clone());
                        } else {
                            enhanced.push(glob.clone());
                        }
                    }
                } else {
                    // Keep specific patterns as-is
                    enhanced.push(glob.clone());
                }
            }

            // If no enhancements were made, use original patterns
            if enhanced.is_empty() {
                globs.to_vec()
            } else {
                enhanced
            }
        }
    } else {
        // If None provided, use all applicable extensions
        applicable_extensions.into_iter().collect::<Vec<_>>()
    };

    // Create combined scan
    let rule_refs: Vec<&RuleConfig<DynamicLang>> = rule_configs.iter().collect();
    let combined_scan = CombinedScan::new(rule_refs);

    // Determine the search base path
    let search_base = if let Some(base) = base_path {
        let base_path_buf = PathBuf::from(base);
        if base_path_buf.is_absolute() {
            base_path_buf
        } else {
            // Make relative to current working directory or provided working_dir
            if let Some(wd) = working_dir {
                wd.join(base_path_buf)
            } else {
                std::env::current_dir()
                    .map_err(AstGrepError::Io)?
                    .join(base_path_buf)
            }
        }
    } else {
        // Default to current working directory or provided working_dir
        working_dir
            .map(|p| p.to_path_buf())
            .unwrap_or_else(|| std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")))
    };

    // Build glob overrides using the enhanced include patterns
    let globs = build_globs(&enhanced_include_globs, exclude_globs, &search_base)?;

    // Use WalkBuilder with globs
    let walker = WalkBuilder::new(&search_base)
        .follow_links(false)
        .git_ignore(true)
        .ignore(true)
        .hidden(false)
        .overrides(globs)
        .build();

    let mut all_matches = Vec::new();

    for entry in walker {
        let entry = entry.map_err(|e| AstGrepError::Io(std::io::Error::other(e)))?;

        println!("SCAN FILE entry: {:?}", entry.path());
        if entry.file_type().is_some_and(|ft| ft.is_file()) {
            let matches = scan_file(entry.path(), &combined_scan, &rule_configs, apply_fixes)
                .await
                .map_err(|e| AstGrepError::Io(std::io::Error::other(e)))?;
            all_matches.extend(matches);
        }
    }

    Ok(all_matches)
}

/// Check if a glob pattern is generic and should be enhanced with language-specific extensions
fn is_generic_glob_pattern(pattern: &str) -> bool {
    matches!(pattern, "**" | "*" | "**/*" | "*.*")
}

/// Build glob overrides for include/exclude patterns
fn build_globs(
    include_globs: &[String],
    exclude_globs: Option<&[String]>,
    base_path: &Path,
) -> Result<Override, AstGrepError> {
    let mut builder = OverrideBuilder::new(base_path);

    // Add include patterns
    for glob in include_globs {
        builder
            .add(glob)
            .map_err(|e| AstGrepError::Glob(format!("Invalid include glob '{glob}': {e}")))?;
    }

    // Add exclude patterns (prefixed with !)
    if let Some(excludes) = exclude_globs {
        for glob in excludes {
            let exclude_pattern = if glob.starts_with('!') {
                glob.to_string()
            } else {
                format!("!{glob}")
            };
            builder.add(&exclude_pattern).map_err(|e| {
                AstGrepError::Glob(format!("Invalid exclude glob '{exclude_pattern}': {e}"))
            })?;
        }
    }

    builder
        .build()
        .map_err(|e| AstGrepError::Glob(format!("Failed to build glob overrides: {e}")))
}

async fn scan_file(
    file_path: &Path,
    combined_scan: &CombinedScan<'_, DynamicLang>,
    _rule_configs: &[RuleConfig<DynamicLang>],
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    let content = fs::read_to_string(file_path)?;
    let language = detect_language(file_path).map_err(|e| AstGrepError::Language(e.to_string()))?;

    println!("language at SCAN FILE FYNC: {:?}", language);

    scan_content(
        &content,
        file_path,
        language,
        combined_scan,
        _rule_configs,
        apply_fixes,
    )
    .await
}

async fn scan_content(
    content: &str,
    file_path: &Path,
    language: SupportedLanguage,
    combined_scan: &CombinedScan<'_, DynamicLang>,
    _rule_configs: &[RuleConfig<DynamicLang>],
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    println!("language at SCAN CONTENT: {:?}", language);
    println!("extensions");

    let dynamic_lang = DynamicLang::from_str(&language.to_string()).unwrap();
    println!("extensions loaded");

    let doc = StrDoc::new(content, dynamic_lang);
    let root = AstGrep::doc(doc);

    // Scan with separate_fix=true when applying fixes to get diffs
    let scan_result = combined_scan.scan(&root, apply_fixes);
    let mut matches = Vec::new();
    let mut file_modified = false;
    let mut new_content = content.to_string();

    // Handle diffs (rules with fixers) when applying fixes
    if apply_fixes && !scan_result.diffs.is_empty() {
        // Collect all edits and sort them in reverse order (from end to start)
        // to avoid offset issues when applying multiple fixes
        let mut edit_infos: Vec<(usize, usize, Vec<u8>)> = Vec::new(); // (position, deleted_length, inserted_text)

        for (rule, node_match) in &scan_result.diffs {
            if let Ok(fixers) = rule.get_fixer() {
                if let Some(fixer) = fixers.first() {
                    let edit = node_match.make_edit(&rule.matcher, fixer);
                    edit_infos.push((edit.position, edit.deleted_length, edit.inserted_text));
                }
            }

            // Also record this as a match for reporting
            let node = node_match.get_node();
            let start_pos = node.start_pos();
            let end_pos = node.end_pos();

            matches.push(AstGrepMatch {
                file_path: file_path.to_string_lossy().to_string(),
                start_byte: node.range().start,
                end_byte: node.range().end,
                start_line: start_pos.line(),
                start_column: start_pos.column(node),
                end_line: end_pos.line(),
                end_column: end_pos.column(node),
                match_text: node.text().to_string(),
                rule_id: rule.id.clone(),
            });
        }

        // Sort edits by position in reverse order (end to start)
        edit_infos.sort_by(|a, b| b.0.cmp(&a.0));

        // Apply edits to content using a proper offset-tracking approach
        if !edit_infos.is_empty() {
            // Build the new content by applying edits in reverse order (end to start)
            // This ensures that earlier edits don't affect the positions of later edits
            let original_content = content;
            let mut new_content_parts = Vec::new();
            let mut last_end = original_content.len();

            // Process edits in reverse order by position
            for (position, deleted_length, inserted_text) in edit_infos.iter() {
                let start = *position;
                let end = start + deleted_length;

                // Validate that the edit is within bounds of the original content
                if start > original_content.len() || end > original_content.len() {
                    eprintln!(
                        "Warning: Edit range {}..{} is beyond original content length {}. Skipping edit.",
                        start, end, original_content.len()
                    );
                    continue;
                }

                // Add the content after this edit (from end of edit to last_end)
                if end < last_end {
                    new_content_parts.push(&original_content.as_bytes()[end..last_end]);
                }

                // Add the replacement text
                new_content_parts.push(inserted_text);

                last_end = start;
            }

            // Add the content before the first edit (from 0 to last_end)
            if last_end > 0 {
                new_content_parts.push(&original_content.as_bytes()[0..last_end]);
            }

            // Reverse the parts since we built them in reverse order
            new_content_parts.reverse();

            // Concatenate all parts
            let mut result_bytes = Vec::new();
            for part in new_content_parts {
                result_bytes.extend_from_slice(part);
            }

            new_content = String::from_utf8(result_bytes).map_err(|e| {
                AstGrepError::Config(format!("Invalid UTF-8 after applying fixes: {e}"))
            })?;
            file_modified = true;
        }
    }

    // Handle regular matches (rules without fixers or when not applying fixes)
    for (rule, rule_matches) in scan_result.matches.into_iter() {
        for match_item in rule_matches {
            let node = match_item.get_node();
            let start_pos = node.start_pos();
            let end_pos = node.end_pos();

            matches.push(AstGrepMatch {
                file_path: file_path.to_string_lossy().to_string(),
                start_byte: node.range().start,
                end_byte: node.range().end,
                start_line: start_pos.line(),
                start_column: start_pos.column(node),
                end_line: end_pos.line(),
                end_column: end_pos.column(node),
                match_text: node.text().to_string(),
                rule_id: rule.id.clone(),
            });
        }
    }

    // Write the modified content back to the file if fixes were applied
    if file_modified {
        fs::write(file_path, new_content)?;
    }

    Ok(matches)
}

fn detect_language(file_path: &Path) -> Result<SupportedLanguage, AstGrepError> {
    let extension = file_path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");

    let language_str = match extension.to_lowercase().as_str() {
        "js" | "mjs" | "cjs" => "javascript",
        "ts" | "mts" | "cts" => "typescript",
        "tsx" => "tsx",
        "jsx" => "javascript", // JSX files often use .js extension
        "py" | "pyi" => "python",
        "rs" => "rust",
        "go" => "go",
        "java" => "java",
        "c" => "c",
        "cpp" | "cc" | "cxx" | "c++" => "cpp",
        "h" | "hpp" | "hxx" => "cpp", // Header files
        "cs" => "csharp",
        "php" => "php",
        "rb" => "ruby",
        "swift" => "swift",
        "kt" | "kts" => "kotlin",
        "scala" => "scala",
        "html" | "htm" => "html",
        "css" => "css",
        "scss" => "scss",
        "less" => "less",
        "json" => "json",
        "yaml" | "yml" => "yaml",
        "xml" => "xml",
        "sql" => "sql",
        "sh" | "bash" => "bash",
        "lua" => "lua",
        "dart" => "dart",
        "elixir" | "ex" | "exs" => "elixir",
        "elm" => "elm",
        "haskell" | "hs" => "haskell",
        "thrift" => "thrift",
        _ => {
            return Err(AstGrepError::Language(format!(
                "Unsupported file extension: {extension}"
            )));
        }
    };

    SupportedLanguage::from_str(language_str)
        .map_err(|_| AstGrepError::Language(format!("Language not supported: {language_str}")))
}

/// Backward compatibility function - converts paths to include globs
pub async fn execute_ast_grep_on_paths(
    paths: &[String],
    config_file: &str,
    working_dir: Option<&Path>,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    execute_ast_grep_on_globs(Some(paths), None, None, config_file, working_dir).await
}

/// Backward compatibility function - converts paths to include globs with fixes
pub async fn execute_ast_grep_on_paths_with_fixes(
    paths: &[String],
    config_file: &str,
    working_dir: Option<&Path>,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    execute_ast_grep_on_globs_with_fixes(Some(paths), None, None, config_file, working_dir).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    fn create_test_file(dir: &Path, name: &str, content: &str) -> PathBuf {
        let file_path = dir.join(name);
        if let Some(parent) = file_path.parent() {
            fs::create_dir_all(parent).unwrap();
        }
        fs::write(&file_path, content).unwrap();
        file_path
    }

    fn create_test_config(dir: &Path, name: &str, rules: &str) -> PathBuf {
        let config_path = dir.join(name);
        fs::write(&config_path, rules).unwrap();
        config_path
    }

    #[test]
    fn test_detect_language() {
        // Test various file extensions
        assert_eq!(
            detect_language(Path::new("test.js")).unwrap().to_string(),
            "JavaScript"
        );
        assert_eq!(
            detect_language(Path::new("test.ts")).unwrap().to_string(),
            "TypeScript"
        );
        assert_eq!(
            detect_language(Path::new("test.tsx")).unwrap().to_string(),
            "Tsx"
        );
        assert_eq!(
            detect_language(Path::new("test.py")).unwrap().to_string(),
            "Python"
        );
        assert_eq!(
            detect_language(Path::new("test.rs")).unwrap().to_string(),
            "Rust"
        );

        // Test error case
        assert!(detect_language(Path::new("test.unknown")).is_err());
    }

    #[tokio::test]
    async fn test_execute_ast_grep_on_globs_with_javascript() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create test JavaScript file
        let js_content = r#"
function hello() {
    console.log("Hello, world!");
    var x = 5;
    let y = 10;
}
"#;
        create_test_file(temp_path, "test.js", js_content);

        // Create ast-grep config
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
---
id: var-declaration
language: javascript
rule:
  pattern: var $VAR = $VALUE
message: "Found var declaration"
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Execute ast-grep
        let matches = execute_ast_grep_on_globs(
            Some(&["test.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find console.log and var declaration
        assert!(
            matches.len() >= 2,
            "Expected at least 2 matches, got {}",
            matches.len()
        );

        // Check that we found console.log
        let console_matches: Vec<_> = matches
            .iter()
            .filter(|m| m.match_text.contains("console.log"))
            .collect();
        assert!(!console_matches.is_empty(), "Should find console.log match");

        // Check that we found var declaration
        let var_matches: Vec<_> = matches
            .iter()
            .filter(|m| m.match_text.contains("var x"))
            .collect();
        assert!(!var_matches.is_empty(), "Should find var declaration match");
    }

    #[tokio::test]
    async fn test_execute_ast_grep_on_globs_with_typescript() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create test TypeScript file
        let ts_content = r#"
function greet(name: string): void {
    console.log(`Hello, ${name}!`);
}

const add = (a: number, b: number): number => {
    return a + b;
};
"#;
        create_test_file(temp_path, "test.ts", ts_content);

        // Create ast-grep config for TypeScript
        let config_content = r#"id: function-declaration
language: typescript
rule:
  pattern: function $NAME($$$) { $$$ }
message: "Found function declaration"
---
id: console-log
language: typescript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
"#;
        let config_path = create_test_config(temp_path, "ts-rules.yaml", config_content);

        // Execute ast-grep
        let matches = execute_ast_grep_on_globs(
            Some(&["test.ts".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find function declaration and console.log
        assert!(
            !matches.is_empty(),
            "Expected at least 1 match, got {}",
            matches.len()
        );

        // Verify we have matches with proper file paths
        for ast_match in &matches {
            assert!(ast_match.file_path.ends_with("test.ts"));
            assert!(ast_match.start_line > 0);
            assert!(ast_match.end_line >= ast_match.start_line);
        }
    }

    #[tokio::test]
    async fn test_execute_ast_grep_on_multiple_files() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create multiple test files
        create_test_file(temp_path, "src/app.js", "console.log('app');");
        create_test_file(temp_path, "src/utils.js", "console.log('utils');");
        create_test_file(temp_path, "test.py", "print('python')"); // Different language

        // Create ast-grep config
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Execute ast-grep on src directory using proper glob pattern
        let matches = execute_ast_grep_on_globs(
            Some(&["src/**/*.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find console.log in both JS files but not the Python file
        assert!(
            matches.len() >= 2,
            "Expected at least 2 matches, got {}",
            matches.len()
        );

        let js_matches: Vec<_> = matches
            .iter()
            .filter(|m| m.file_path.ends_with(".js"))
            .collect();
        assert_eq!(js_matches.len(), 2, "Should find exactly 2 JS matches");
    }

    #[tokio::test]
    async fn test_execute_ast_grep_with_json_config() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create test file
        create_test_file(temp_path, "test.js", "console.log('test');");

        // Create JSON config instead of YAML (array format)
        let config_content = r#"
[
  {
    "id": "console-log",
    "language": "javascript",
    "rule": {
      "pattern": "console.log($$$)"
    },
    "message": "Found console.log statement"
  }
]
"#;
        let config_path = create_test_config(temp_path, "rules.json", config_content);

        // Execute ast-grep
        let matches = execute_ast_grep_on_globs(
            Some(&["test.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        assert!(
            !matches.is_empty(),
            "Expected at least 1 match with JSON config"
        );
    }

    #[tokio::test]
    async fn test_execute_ast_grep_no_matches() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create test file with no console.log
        create_test_file(temp_path, "test.js", "let x = 5; // No console.log here");

        // Create ast-grep config
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Execute ast-grep
        let matches = execute_ast_grep_on_globs(
            Some(&["test.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find no matches
        assert_eq!(
            matches.len(),
            0,
            "Expected no matches, got {}",
            matches.len()
        );
    }

    #[tokio::test]
    async fn test_execute_ast_grep_nonexistent_file() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create config but no target file
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Execute ast-grep on nonexistent file - should handle gracefully
        let result = execute_ast_grep_on_globs(
            Some(&["nonexistent.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await;

        // Should return empty results, not error
        assert!(result.is_ok());
        let matches = result.unwrap();
        assert_eq!(matches.len(), 0);
    }

    #[tokio::test]
    async fn test_execute_ast_grep_with_recursive_glob() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create nested directory structure with multiple files
        create_test_file(temp_path, "src/app.js", "console.log('app');");
        create_test_file(temp_path, "src/utils/helper.js", "console.log('helper');");
        create_test_file(
            temp_path,
            "src/components/Button.tsx",
            "console.log('button');",
        );
        create_test_file(temp_path, "tests/unit/app.test.js", "console.log('test');");
        create_test_file(temp_path, "docs/readme.md", "# README"); // Non-JS file

        // Create ast-grep config
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Test recursive glob pattern
        let matches = execute_ast_grep_on_globs(
            Some(&["**/*.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find console.log in all JS files but not in .tsx or .md files
        assert!(
            matches.len() >= 3,
            "Expected at least 3 matches from JS files, got {}",
            matches.len()
        );

        // Verify matches are from JS files only
        for ast_match in &matches {
            assert!(
                ast_match.file_path.ends_with(".js"),
                "Match should be from .js file: {}",
                ast_match.file_path
            );
        }

        // Test more specific pattern
        let matches = execute_ast_grep_on_globs(
            Some(&["src/**/*.js".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find console.log in src/ JS files only (not tests/)
        assert!(
            !matches.is_empty(),
            "Expected at least 1 match from src/ JS files, got {}",
            matches.len()
        );

        // Verify all matches are from src/ directory
        for ast_match in &matches {
            assert!(
                ast_match.file_path.contains("src/"),
                "Match should be from src/ directory: {}",
                ast_match.file_path
            );
        }
    }

    #[tokio::test]
    async fn test_execute_ast_grep_with_fixes() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create test JavaScript file with fixable issues
        create_test_file(
            temp_path,
            "test.js",
            r#"function greetUser(name) {
  console.log("Hello, " + name + "!");
  var userCount = 0;
  userCount++;
  console.log("Total users:", userCount);
}

console.log("Test");
"#,
        );

        // Create ast-grep config with fixes
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$ARGS)
fix: logger.info($$$ARGS)
message: "Found console.log statement"
---
id: var-declaration
language: javascript
rule:
  pattern: var $VAR = $VALUE
fix: let $VAR = $VALUE
message: "Found var declaration"
"#;
        create_test_config(temp_path, "rules.yaml", config_content);

        // Execute with fixes
        let matches = execute_ast_grep_on_globs_with_fixes(
            Some(&["test.js".to_string()]),
            None,
            None,
            "rules.yaml",
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find matches
        assert!(!matches.is_empty());
        println!("Found {} matches with fixes applied", matches.len());

        // Check that fixes were applied by reading the file
        let modified_content = fs::read_to_string(temp_path.join("test.js")).unwrap();
        println!("Modified content:\n{modified_content}");

        // Verify fixes were applied
        assert!(modified_content.contains("logger.info"));
        assert!(modified_content.contains("let userCount"));
        assert!(!modified_content.contains("console.log"));
        assert!(!modified_content.contains("var userCount"));
    }

    #[tokio::test]
    async fn test_automatic_language_extension_inference() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create test files with different extensions
        create_test_file(temp_path, "app.js", "console.log('js file');");
        create_test_file(temp_path, "utils.mjs", "console.log('mjs file');");
        create_test_file(temp_path, "config.ts", "console.log('ts file');");
        create_test_file(temp_path, "component.tsx", "console.log('tsx file');");
        create_test_file(temp_path, "script.py", "print('python file')"); // Different language
        create_test_file(temp_path, "readme.md", "# Markdown file"); // Different language

        // Create config with JavaScript, TypeScript, and TSX rules
        let config_content = r#"id: console-log-js
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement in JavaScript"
---
id: console-log-ts
language: typescript
rule:
  pattern: console.log($$$)
message: "Found console.log statement in TypeScript"
---
id: console-log-tsx
language: tsx
rule:
  pattern: console.log($$$)
message: "Found console.log statement in TSX"
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Test with empty include patterns - should auto-infer extensions
        let matches = execute_ast_grep_on_globs(
            None, // None means auto-infer from rule languages
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Debug: print all matches
        println!("Found {} total matches:", matches.len());
        for (i, ast_match) in matches.iter().enumerate() {
            println!(
                "  {}: {} (rule: {})",
                i + 1,
                ast_match.file_path,
                ast_match.rule_id
            );
        }

        // Should find console.log in JS/TS files but not Python or Markdown
        assert!(
            matches.len() >= 4, // Now we should get 4: 2 JS, 1 TS, 1 TSX
            "Expected at least 4 matches from JS/TS/TSX files, got {}",
            matches.len()
        );

        // Verify matches are from JS/TS files only
        let mut js_count = 0;
        let mut ts_count = 0;
        let mut tsx_count = 0;
        for ast_match in &matches {
            if ast_match.file_path.ends_with(".js") || ast_match.file_path.ends_with(".mjs") {
                js_count += 1;
            } else if ast_match.file_path.ends_with(".ts") {
                ts_count += 1;
            } else if ast_match.file_path.ends_with(".tsx") {
                tsx_count += 1;
            } else {
                panic!("Unexpected file type in matches: {}", ast_match.file_path);
            }
        }

        println!("JS matches: {js_count}, TS matches: {ts_count}, TSX matches: {tsx_count}");

        assert!(js_count >= 2, "Should find matches in JS files");
        assert!(ts_count >= 1, "Should find matches in TS files");
        assert!(tsx_count >= 1, "Should find matches in TSX files");

        // Verify no matches from .py or .md files by checking file paths
        for ast_match in &matches {
            assert!(
                !ast_match.file_path.ends_with(".py") && !ast_match.file_path.ends_with(".md"),
                "Should not match Python or Markdown files: {}",
                ast_match.file_path
            );
        }
    }

    #[tokio::test]
    async fn test_generic_glob_enhancement() {
        let temp_dir = TempDir::new().unwrap();
        let temp_path = temp_dir.path();

        // Create nested structure with various file types
        create_test_file(temp_path, "src/app.js", "console.log('app');");
        create_test_file(temp_path, "src/utils.ts", "console.log('utils');");
        create_test_file(temp_path, "docs/readme.md", "# README");
        create_test_file(temp_path, "scripts/build.py", "print('build')");

        // Create JavaScript-only config
        let config_content = r#"id: console-log
language: javascript
rule:
  pattern: console.log($$$)
message: "Found console.log statement"
"#;
        let config_path = create_test_config(temp_path, "rules.yaml", config_content);

        // Test with generic glob pattern "**" - should be enhanced to "**/*.js", "**/*.mjs", "**/*.cjs"
        let matches = execute_ast_grep_on_globs(
            Some(&["**".to_string()]),
            None,
            None,
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .await
        .unwrap();

        // Should find matches in JS files only, not TS, MD, or PY
        assert!(!matches.is_empty());
        for ast_match in &matches {
            assert!(
                ast_match.file_path.ends_with(".js"),
                "With JavaScript rules, should only match .js files, got: {}",
                ast_match.file_path
            );
        }
    }
}
