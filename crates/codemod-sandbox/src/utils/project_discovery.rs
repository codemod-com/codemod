use std::path::{Path, PathBuf};

/// Find tsconfig.json by traversing up from the given directory
pub fn find_tsconfig(start_dir: &Path) -> Option<PathBuf> {
    let mut current_dir = start_dir.to_path_buf();
    loop {
        let tsconfig_path = current_dir.join("tsconfig.json");
        if tsconfig_path.exists() {
            return Some(tsconfig_path);
        }

        match current_dir.parent() {
            Some(parent) => current_dir = parent.to_path_buf(),
            None => break,
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_find_tsconfig() {
        let temp_dir = TempDir::new().unwrap();
        let base_dir = temp_dir.path();

        // Create a nested directory structure
        let nested_dir = base_dir.join("src").join("components");
        fs::create_dir_all(&nested_dir).unwrap();

        // Create tsconfig.json in the base directory
        let tsconfig_path = base_dir.join("tsconfig.json");
        fs::write(&tsconfig_path, r#"{"compilerOptions": {"baseUrl": "."}}"#).unwrap();

        // Should find tsconfig.json when starting from nested directory
        let found = find_tsconfig(&nested_dir);
        assert!(found.is_some());
        assert_eq!(found.unwrap(), tsconfig_path);

        // Should return None when no tsconfig.json exists
        let temp_dir2 = TempDir::new().unwrap();
        let found = find_tsconfig(temp_dir2.path());
        assert!(found.is_none());
    }
}
