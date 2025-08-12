use std::collections::HashMap;

#[cfg(feature = "native")]
use ast_grep_language::SupportLang;

/// Creates a map from SupportLang to their associated file extensions
pub fn create_language_extension_map() -> HashMap<SupportLang, Vec<&'static str>> {
    let mut map = HashMap::new();

    #[cfg(feature = "native")]
    {
        use ast_grep_language::SupportLang::*;

        map.insert(JavaScript, vec![".js", ".mjs", ".cjs", ".jsx"]);
        map.insert(
            TypeScript,
            vec![".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"],
        );
        map.insert(
            Tsx,
            vec![".tsx", ".jsx", ".ts", ".js", ".mjs", ".cjs", ".mts", ".cts"],
        );
        map.insert(Bash, vec![".sh", ".bash", ".zsh", ".fish"]);
        map.insert(C, vec![".c", ".h"]);
        map.insert(CSharp, vec![".cs"]);
        map.insert(Css, vec![".css"]);
        map.insert(
            Cpp,
            vec![".cpp", ".cxx", ".cc", ".c++", ".hpp", ".hxx", ".hh", ".h++"],
        );
        map.insert(Elixir, vec![".ex", ".exs"]);
        map.insert(Go, vec![".go"]);
        map.insert(Haskell, vec![".hs", ".lhs"]);
        map.insert(Html, vec![".html", ".htm"]);
        map.insert(Java, vec![".java"]);
        map.insert(Json, vec![".json", ".jsonc"]);
        map.insert(Kotlin, vec![".kt", ".kts"]);
        map.insert(Lua, vec![".lua"]);
        map.insert(
            Php,
            vec![
                ".php", ".phtml", ".php3", ".php4", ".php5", ".php7", ".phps", ".php-s",
            ],
        );
        map.insert(Python, vec![".py", ".pyw", ".pyi"]);
        map.insert(Ruby, vec![".rb", ".rbw"]);
        map.insert(Rust, vec![".rs"]);
        map.insert(Scala, vec![".scala", ".sc"]);
        map.insert(Swift, vec![".swift"]);
        map.insert(Yaml, vec![".yaml", ".yml"]);
    }

    map
}

/// Get file extensions for a specific language
pub fn get_extensions_for_language(lang: SupportLang) -> Vec<&'static str> {
    let map = create_language_extension_map();
    map.get(&lang).cloned().unwrap_or_default()
}

/// Determine language from file extension
pub fn get_language_from_extension(extension: &str) -> Option<SupportLang> {
    let map = create_language_extension_map();

    for (lang, extensions) in map.iter() {
        if extensions.contains(&extension) {
            return Some(*lang);
        }
    }

    None
}

/// Get all supported file extensions
pub fn get_all_supported_extensions() -> Vec<&'static str> {
    let map = create_language_extension_map();
    let mut extensions: Vec<&'static str> = map.values().flatten().copied().collect();
    extensions.sort();
    extensions.dedup();
    extensions
}

#[cfg(all(test, feature = "native"))]
mod tests {
    use super::*;

    #[test]
    fn test_language_extension_mapping() {
        let map = create_language_extension_map();
        assert!(!map.is_empty());

        #[cfg(feature = "native")]
        {
            use ast_grep_language::SupportLang::*;
            assert!(map.get(&JavaScript).unwrap().contains(&".js"));
            assert!(map.get(&TypeScript).unwrap().contains(&".ts"));
            assert!(map.get(&Rust).unwrap().contains(&".rs"));
        }
    }

    #[test]
    fn test_get_extensions_for_language() {
        use ast_grep_language::SupportLang::*;
        let js_extensions = get_extensions_for_language(JavaScript);
        assert!(js_extensions.contains(&".js"));
        assert!(js_extensions.contains(&".mjs"));
        assert!(js_extensions.contains(&".cjs"));
    }

    #[test]
    fn test_get_language_from_extension() {
        let lang = get_language_from_extension(".rs");
        assert!(lang.is_some());

        let lang = get_language_from_extension(".unknown");
        assert!(lang.is_none());
    }

    #[test]
    fn test_get_all_supported_extensions() {
        let extensions = get_all_supported_extensions();
        assert!(!extensions.is_empty());
        assert!(extensions.contains(&".js"));
        assert!(extensions.contains(&".rs"));
        assert!(extensions.contains(&".py"));
    }
}
