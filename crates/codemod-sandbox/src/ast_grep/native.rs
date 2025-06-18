use std::fs;
use std::path::{Path, PathBuf};
use std::str::FromStr;

use ast_grep_config::{from_yaml_string, CombinedScan, RuleConfig};
use ast_grep_core::tree_sitter::StrDoc;
use ast_grep_core::AstGrep;
use ast_grep_language::SupportLang;
use ignore::WalkBuilder;
use serde_json;
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

/// Execute ast-grep on the specified paths using the given config file
///
/// # Arguments
/// * `paths` - Glob patterns for paths to search
/// * `config_file` - Path to the ast-grep configuration file (.yaml or .json)
/// * `working_dir` - Optional working directory to resolve relative paths
///
/// # Returns
/// Vector of matches found across all files
pub fn execute_ast_grep_on_paths(
    paths: &[String],
    config_file: &str,
    working_dir: Option<&Path>,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    execute_ast_grep_on_paths_with_options(paths, config_file, working_dir, false)
}

/// Execute ast-grep on the given paths with option to apply fixes
pub fn execute_ast_grep_on_paths_with_fixes(
    paths: &[String],
    config_file: &str,
    working_dir: Option<&Path>,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    execute_ast_grep_on_paths_with_options(paths, config_file, working_dir, true)
}

fn execute_ast_grep_on_paths_with_options(
    paths: &[String],
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
                AstGrepError::Config(format!("Failed to convert JSON to YAML: {}", e))
            })?;
            let mut rules = from_yaml_string(&yaml_string, &Default::default())
                .map_err(|e| AstGrepError::Config(format!("Failed to parse rule: {:?}", e)))?;
            configs.append(&mut rules);
        }
        configs
    } else {
        // Default to YAML with --- delimited documents
        from_yaml_string(&config_content, &Default::default())
            .map_err(|e| AstGrepError::Config(format!("Failed to parse YAML rules: {:?}", e)))?
    };

    if rule_configs.is_empty() {
        return Ok(Vec::new());
    }

    // Create combined scan
    let rule_refs: Vec<&RuleConfig<SupportLang>> = rule_configs.iter().collect();
    let combined_scan = CombinedScan::new(rule_refs);

    let mut all_matches = Vec::new();

    // Process each path pattern
    for path_pattern in paths {
        let resolved_path = if let Some(wd) = working_dir {
            wd.join(path_pattern)
        } else {
            PathBuf::from(path_pattern)
        };

        // Handle different path types
        if resolved_path.is_file() {
            // Single file
            let matches = scan_file(&resolved_path, &combined_scan, &rule_configs, apply_fixes)?;
            all_matches.extend(matches);
        } else if resolved_path.is_dir() {
            // Directory - walk recursively
            let matches =
                scan_directory(&resolved_path, &combined_scan, &rule_configs, apply_fixes)?;
            all_matches.extend(matches);
        } else {
            // Pattern matching using ignore crate
            let matches = scan_pattern(
                path_pattern,
                working_dir,
                &combined_scan,
                &rule_configs,
                apply_fixes,
            )?;
            all_matches.extend(matches);
        }
    }

    Ok(all_matches)
}

fn scan_file(
    file_path: &Path,
    combined_scan: &CombinedScan<SupportLang>,
    rule_configs: &[RuleConfig<SupportLang>],
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    let content = fs::read_to_string(file_path)?;
    let language = detect_language(file_path)?;

    scan_content(
        &content,
        file_path,
        language,
        combined_scan,
        rule_configs,
        apply_fixes,
    )
}

fn scan_directory(
    dir_path: &Path,
    combined_scan: &CombinedScan<SupportLang>,
    rule_configs: &[RuleConfig<SupportLang>],
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    let mut all_matches = Vec::new();

    for entry in WalkBuilder::new(dir_path)
        .follow_links(false)
        .git_ignore(true)
        .build()
    {
        let entry = entry.map_err(|e| AstGrepError::Io(std::io::Error::other(e)))?;

        if entry.file_type().is_some_and(|ft| ft.is_file()) {
            let matches = scan_file(entry.path(), combined_scan, rule_configs, apply_fixes)?;
            all_matches.extend(matches);
        }
    }

    Ok(all_matches)
}

fn scan_pattern(
    pattern: &str,
    working_dir: Option<&Path>,
    combined_scan: &CombinedScan<SupportLang>,
    rule_configs: &[RuleConfig<SupportLang>],
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    let mut all_matches = Vec::new();
    let base_dir = working_dir.unwrap_or(Path::new("."));

    // For recursive patterns (containing **), start from base directory
    // For other patterns, try to determine the actual directory to search
    let search_path = if pattern.contains("**") {
        base_dir.to_path_buf()
    } else {
        let (search_dir, _file_pattern) = parse_glob_pattern(pattern);
        if search_dir.is_empty() {
            base_dir.to_path_buf()
        } else {
            let candidate_path = base_dir.join(search_dir);
            if candidate_path.exists() {
                candidate_path
            } else {
                // Directory doesn't exist, search from base
                base_dir.to_path_buf()
            }
        }
    };

    // Use WalkBuilder for better control over traversal
    let walker = WalkBuilder::new(&search_path)
        .follow_links(false)
        .git_ignore(true)
        .ignore(true)
        .hidden(false)
        .build();

    for entry in walker {
        let entry = entry.map_err(|e| AstGrepError::Io(std::io::Error::other(e)))?;

        if entry.file_type().is_some_and(|ft| ft.is_file()) {
            let path = entry.path();

            // Check if path matches the pattern using improved glob matching
            if matches_glob_pattern(path, pattern, base_dir) {
                let matches = scan_file(path, combined_scan, rule_configs, apply_fixes)?;
                all_matches.extend(matches);
            }
        }
    }

    Ok(all_matches)
}

fn scan_content(
    content: &str,
    file_path: &Path,
    language: SupportLang,
    combined_scan: &CombinedScan<SupportLang>,
    _rule_configs: &[RuleConfig<SupportLang>],
    apply_fixes: bool,
) -> Result<Vec<AstGrepMatch>, AstGrepError> {
    let doc = StrDoc::new(content, language);
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
            if let Some(fixer) = rule.get_fixer().unwrap_or(None) {
                let edit = node_match.make_edit(&rule.matcher, &fixer);
                edit_infos.push((edit.position, edit.deleted_length, edit.inserted_text));

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
        }

        // Sort edits by position in reverse order (end to start)
        edit_infos.sort_by(|a, b| b.0.cmp(&a.0));

        // Apply edits to content
        if !edit_infos.is_empty() {
            let content_bytes = content.as_bytes();
            let mut result_bytes = content_bytes.to_vec();

            for (position, deleted_length, inserted_text) in edit_infos {
                let start = position;
                let end = position + deleted_length;

                // Replace the range with the new content
                result_bytes.splice(start..end, inserted_text.iter().cloned());
            }

            new_content = String::from_utf8(result_bytes).map_err(|e| {
                AstGrepError::Config(format!("Invalid UTF-8 after applying fixes: {}", e))
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

fn detect_language(file_path: &Path) -> Result<SupportLang, AstGrepError> {
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
                "Unsupported file extension: {}",
                extension
            )));
        }
    };

    SupportLang::from_str(language_str)
        .map_err(|_| AstGrepError::Language(format!("Language not supported: {}", language_str)))
}

/// Parse a glob pattern to extract directory and file pattern components
fn parse_glob_pattern(pattern: &str) -> (&str, &str) {
    // Split pattern into directory part and file pattern part
    if let Some(last_slash) = pattern.rfind('/') {
        let (dir_part, file_part) = pattern.split_at(last_slash + 1);
        (dir_part.trim_end_matches('/'), file_part)
    } else {
        ("", pattern)
    }
}

/// Check if a path matches a glob pattern
fn matches_glob_pattern(path: &Path, pattern: &str, base_dir: &Path) -> bool {
    // Get relative path from base directory
    let rel_path = if let Ok(relative) = path.strip_prefix(base_dir) {
        relative
    } else {
        path
    };

    let path_str = rel_path.to_string_lossy();
    let path_str = path_str.replace('\\', "/"); // Normalize path separators

    // Handle different glob patterns
    if pattern.contains("**") {
        // Recursive glob pattern (e.g., "src/**/*.js")
        matches_recursive_glob(&path_str, pattern)
    } else if pattern.contains('*') {
        // Simple glob pattern (e.g., "*.js", "src/*.ts")
        matches_simple_glob(&path_str, pattern)
    } else {
        // Exact match or substring match
        path_str == pattern || path_str.ends_with(pattern)
    }
}

/// Match simple glob patterns with single * wildcards
fn matches_simple_glob(path: &str, pattern: &str) -> bool {
    let pattern_parts: Vec<&str> = pattern.split('*').collect();

    if pattern_parts.len() == 1 {
        // No wildcards - exact match
        return path == pattern;
    }

    if pattern_parts.len() == 2 {
        // Single wildcard (e.g., "*.js", "src/*.ts")
        let prefix = pattern_parts[0];
        let suffix = pattern_parts[1];

        if prefix.is_empty() {
            // Pattern like "*.js"
            path.ends_with(suffix)
        } else if suffix.is_empty() {
            // Pattern like "src/*"
            path.starts_with(prefix)
        } else {
            // Pattern like "src/*.js"
            path.starts_with(prefix) && path.ends_with(suffix)
        }
    } else {
        // Multiple wildcards - more complex matching
        let mut path_pos = 0;

        for (i, part) in pattern_parts.iter().enumerate() {
            if part.is_empty() {
                continue;
            }

            if i == 0 {
                // First part must match from the beginning
                if !path[path_pos..].starts_with(part) {
                    return false;
                }
                path_pos += part.len();
            } else if i == pattern_parts.len() - 1 {
                // Last part must match at the end
                return path[path_pos..].ends_with(part);
            } else {
                // Middle parts must be found somewhere
                if let Some(pos) = path[path_pos..].find(part) {
                    path_pos += pos + part.len();
                } else {
                    return false;
                }
            }
        }

        true
    }
}

/// Match recursive glob patterns with ** wildcards
fn matches_recursive_glob(path: &str, pattern: &str) -> bool {
    // Handle patterns like "src/**/*.js" or "**/*.ts"
    if let Some(double_star_pos) = pattern.find("**") {
        let before_double_star = &pattern[..double_star_pos];
        let after_double_star = &pattern[double_star_pos + 2..];

        // Remove leading slash from after_double_star if present
        let after_double_star = after_double_star
            .strip_prefix('/')
            .unwrap_or(after_double_star);

        // Check prefix match
        let prefix_matches = if before_double_star.is_empty() {
            true // Pattern starts with **
        } else {
            let prefix = before_double_star.trim_end_matches('/');
            path.starts_with(prefix)
        };

        if !prefix_matches {
            return false;
        }

        // Check suffix match
        if after_double_star.is_empty() {
            true // Pattern ends with **
        } else {
            // For patterns like "src/**/*.js", we need to match "*.js" somewhere after "src/"
            let relevant_part = if before_double_star.is_empty() {
                path
            } else {
                let prefix = before_double_star.trim_end_matches('/');
                if let Some(pos) = path.find(prefix) {
                    &path[pos + prefix.len()..]
                } else {
                    return false;
                }
            };

            // Now match the suffix pattern against the relevant part
            if after_double_star.contains('*') {
                matches_simple_glob(relevant_part, after_double_star)
            } else {
                relevant_part.contains(after_double_star)
                    || relevant_part.ends_with(after_double_star)
            }
        }
    } else {
        // No ** found, treat as simple glob
        matches_simple_glob(path, pattern)
    }
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
        assert_eq!(
            detect_language(Path::new("test.js")).unwrap().to_string(),
            "JavaScript"
        );
        assert_eq!(
            detect_language(Path::new("test.ts")).unwrap().to_string(),
            "TypeScript"
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

    #[test]
    fn test_matches_pattern() {
        let base_dir = Path::new("/test");

        // Exact matches
        assert!(matches_glob_pattern(
            Path::new("/test/test.js"),
            "test.js",
            base_dir
        ));
        assert!(matches_glob_pattern(
            Path::new("/test/src/test.js"),
            "test.js",
            base_dir
        ));

        // Wildcard patterns
        assert!(matches_glob_pattern(
            Path::new("/test/test.js"),
            "*.js",
            base_dir
        ));
        assert!(matches_glob_pattern(
            Path::new("/test/src/test.js"),
            "src/*.js",
            base_dir
        ));
        assert!(matches_glob_pattern(
            Path::new("/test/src/components/App.tsx"),
            "*.tsx",
            base_dir
        ));

        // Non-matches
        assert!(!matches_glob_pattern(
            Path::new("/test/test.py"),
            "*.js",
            base_dir
        ));
        assert!(!matches_glob_pattern(
            Path::new("/test/other.js"),
            "test.js",
            base_dir
        ));
    }

    #[test]
    fn test_glob_pattern_matching() {
        let base_dir = Path::new("/test");

        // Simple glob patterns
        assert!(matches_glob_pattern(
            Path::new("/test/app.js"),
            "*.js",
            base_dir
        ));
        assert!(matches_glob_pattern(
            Path::new("/test/src/app.js"),
            "src/*.js",
            base_dir
        ));
        assert!(!matches_glob_pattern(
            Path::new("/test/app.py"),
            "*.js",
            base_dir
        ));

        // Recursive glob patterns
        assert!(matches_glob_pattern(
            Path::new("/test/src/components/App.tsx"),
            "**/*.tsx",
            base_dir
        ));
        assert!(matches_glob_pattern(
            Path::new("/test/src/utils/helpers.js"),
            "src/**/*.js",
            base_dir
        ));
        assert!(!matches_glob_pattern(
            Path::new("/test/src/utils/helpers.py"),
            "src/**/*.js",
            base_dir
        ));

        // Exact path matches
        assert!(matches_glob_pattern(
            Path::new("/test/package.json"),
            "package.json",
            base_dir
        ));
        assert!(!matches_glob_pattern(
            Path::new("/test/other.json"),
            "package.json",
            base_dir
        ));
    }

    #[test]
    fn test_parse_glob_pattern() {
        assert_eq!(parse_glob_pattern("*.js"), ("", "*.js"));
        assert_eq!(parse_glob_pattern("src/*.js"), ("src", "*.js"));
        assert_eq!(
            parse_glob_pattern("src/components/**/*.tsx"),
            ("src/components/**", "*.tsx")
        );
        assert_eq!(parse_glob_pattern("package.json"), ("", "package.json"));
    }

    #[test]
    fn test_execute_ast_grep_on_paths_with_javascript() {
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
        let matches = execute_ast_grep_on_paths(
            &["test.js".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
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

    #[test]
    fn test_execute_ast_grep_on_paths_with_typescript() {
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
        let matches = execute_ast_grep_on_paths(
            &["test.ts".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
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

    #[test]
    fn test_execute_ast_grep_on_multiple_files() {
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

        // Execute ast-grep on directory
        let matches = execute_ast_grep_on_paths(
            &["src/".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
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

    #[test]
    fn test_execute_ast_grep_with_json_config() {
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
        let matches = execute_ast_grep_on_paths(
            &["test.js".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .unwrap();

        assert!(
            !matches.is_empty(),
            "Expected at least 1 match with JSON config"
        );
    }

    #[test]
    fn test_execute_ast_grep_no_matches() {
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
        let matches = execute_ast_grep_on_paths(
            &["test.js".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
        .unwrap();

        // Should find no matches
        assert_eq!(
            matches.len(),
            0,
            "Expected no matches, got {}",
            matches.len()
        );
    }

    #[test]
    fn test_execute_ast_grep_nonexistent_file() {
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
        let result = execute_ast_grep_on_paths(
            &["nonexistent.js".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        );

        // Should return empty results, not error
        assert!(result.is_ok());
        let matches = result.unwrap();
        assert_eq!(matches.len(), 0);
    }

    #[test]
    fn test_execute_ast_grep_with_recursive_glob() {
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
        let matches = execute_ast_grep_on_paths(
            &["**/*.js".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
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
        let matches = execute_ast_grep_on_paths(
            &["src/**/*.js".to_string()],
            config_path.to_str().unwrap(),
            Some(temp_path),
        )
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

    #[test]
    fn test_execute_ast_grep_with_fixes() {
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
        let matches = execute_ast_grep_on_paths_with_fixes(
            &["test.js".to_string()],
            "rules.yaml",
            Some(temp_path),
        )
        .unwrap();

        // Should find matches
        assert!(!matches.is_empty());
        println!("Found {} matches with fixes applied", matches.len());

        // Check that fixes were applied by reading the file
        let modified_content = fs::read_to_string(temp_path.join("test.js")).unwrap();
        println!("Modified content:\n{}", modified_content);

        // Verify fixes were applied
        assert!(modified_content.contains("logger.info"));
        assert!(modified_content.contains("let userCount"));
        assert!(!modified_content.contains("console.log"));
        assert!(!modified_content.contains("var userCount"));
    }
}
