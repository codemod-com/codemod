use ast_grep_dynamic::{DynamicLang, Registration};
use dirs::data_local_dir;
use reqwest;
use serde::{Deserialize, Serialize};
use std::{env, fmt, str::FromStr};

use crate::sandbox::engine::language_data::get_extensions_for_language;

pub async fn load_tree_sitter(language: &SupportedLanguage) -> Result<DynamicLang, String> {
    let extensions = get_extensions_for_language(language.to_string().as_str());
    let os: &'static str = if env::consts::OS == "macos" {
        "darwin"
    } else if env::consts::OS == "windows" {
        "win32"
    } else if env::consts::OS == "linux" {
        "linux"
    } else {
        env::consts::OS
    };
    let arch = if env::consts::ARCH == "aarch64" {
        "arm64"
    } else if env::consts::ARCH == "x86_64" {
        "x64"
    } else {
        env::consts::ARCH
    };
    let extension = if os == "darwin" {
        "dylib"
    } else if os == "linux" {
        "so"
    } else if os == "win32" {
        "dll"
    } else {
        "so"
    };
    let lib_path = data_local_dir().unwrap().join(format!(
        "codemod/tree_sitter/{}/{}-{}.{}",
        language.to_string(),
        os,
        arch,
        extension
    ));
    if !lib_path.exists() {
        if let Some(parent) = lib_path.parent() {
            std::fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        let url = format!("https://tree-sitter-parsers.s3.us-east-1.amazonaws.com/tree-sitter/parsers/tree-sitter-{}/latest/{}-{}.{}", language.to_string(), os, arch, extension);
        let response = reqwest::get(url)
            .await
            .map_err(|e| format!("Failed to download: {}", e))?;
        let body = response
            .bytes()
            .await
            .map_err(|e| format!("Failed to read response: {}", e))?;
        std::fs::write(&lib_path, body).map_err(|e| format!("Failed to write file: {}", e))?;
    }
    unsafe {
        DynamicLang::register(vec![Registration {
            lang_name: language.to_string(),
            lib_path: lib_path.clone(),
            symbol: format!("tree_sitter_{}", language.to_string()),
            meta_var_char: Some('$'),
            expando_char: Some('$'),
            extensions: extensions.into_iter().map(|s| s.to_string()).collect(),
        }])
        .map_err(|e| format!("Failed to register Rust language: {}", e))?;
    }
    Ok(DynamicLang::from_str(&language.to_string()).unwrap())
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum SupportedLanguage {
    Typescript,
    Javascript,
    Python,
    Rust,
    Go,
    Java,
}

impl fmt::Display for SupportedLanguage {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let name = match self {
            SupportedLanguage::Typescript => "typescript",
            SupportedLanguage::Javascript => "javascript",
            SupportedLanguage::Python => "python",
            SupportedLanguage::Rust => "rust",
            SupportedLanguage::Go => "go",
            SupportedLanguage::Java => "java",
        };
        write!(f, "{}", name)
    }
}

impl FromStr for SupportedLanguage {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "typescript" => Ok(SupportedLanguage::Typescript),
            "javascript" => Ok(SupportedLanguage::Javascript),
            "python" => Ok(SupportedLanguage::Python),
            "rust" => Ok(SupportedLanguage::Rust),
            "go" => Ok(SupportedLanguage::Go),
            "java" => Ok(SupportedLanguage::Java),
            _ => Err(format!("Unsupported language: {}", s)),
        }
    }
}
