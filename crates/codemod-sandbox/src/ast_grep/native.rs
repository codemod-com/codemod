use std::fs;
use std::path::Path;
use std::str::FromStr;

use ast_grep_config::{from_yaml_string, CombinedScan, RuleConfig};
use ast_grep_core::tree_sitter::StrDoc;
use ast_grep_core::AstGrep;
use ast_grep_language::SupportLang;

use crate::ast_grep::scanner::scan_content;
use crate::ast_grep::types::{AstGrepError, AstGrepMatch};
use crate::ast_grep::utils::detect_language_from_extension;

pub fn execute_ast_grep(
    file_path: &Path,
    config_file_path: &str,
    apply_fixes: bool,
) -> Result<(Vec<AstGrepMatch>, bool, Option<String>), AstGrepError> {
    let config_content = fs::read_to_string(config_file_path)?;
    let rule_configs = from_yaml_string(&config_content, &Default::default())
        .map_err(|e| AstGrepError::Config(format!("Failed to parse YAML rules: {e:?}")))?;

    let rule_refs: Vec<&RuleConfig<SupportLang>> = rule_configs.iter().collect();
    let combined_scan = CombinedScan::new(rule_refs);

    scan_file(file_path, &combined_scan, apply_fixes)
}

fn scan_file(
    file_path: &Path,
    combined_scan: &CombinedScan<SupportLang>,
    apply_fixes: bool,
) -> Result<(Vec<AstGrepMatch>, bool, Option<String>), AstGrepError> {
    let content = fs::read_to_string(file_path)?;

    let language_str = detect_language_from_extension(
        file_path
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or_default(),
    )?;

    let language = SupportLang::from_str(language_str)
        .map_err(|_| AstGrepError::Language(format!("Language not supported: {language_str}")))?;

    let doc = StrDoc::new(&content, language);
    let root = AstGrep::doc(doc);

    let scan_result = scan_content(
        &root,
        &content,
        file_path.to_string_lossy().to_string(),
        combined_scan,
        apply_fixes,
    )?;

    let file_modified = scan_result.file_modified;
    let new_content = if file_modified {
        Some(scan_result.new_content)
    } else {
        None
    };

    Ok((scan_result.matches, file_modified, new_content))
}
