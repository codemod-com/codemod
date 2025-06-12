use crate::rquickjs_compat::{
    loader::{Loader, Resolver},
    module, Ctx, Error, Module, Result,
};
use crate::utils::transpiler;
use std::path::PathBuf;

/// QuickJS-compatible resolver adapter
pub struct QuickJSResolver {
    base_dir: PathBuf,
}

impl QuickJSResolver {
    pub fn new(base_dir: PathBuf) -> Self {
        Self { base_dir }
    }
}

impl Resolver for QuickJSResolver {
    fn resolve(&mut self, _ctx: &Ctx<'_>, base: &str, name: &str) -> Result<String> {
        // Handle relative imports
        if name.starts_with("./") || name.starts_with("../") {
            let base_path = if base.is_empty() {
                self.base_dir.clone()
            } else {
                let base_file = std::path::Path::new(base);
                if base_file.is_absolute() {
                    base_file.parent().unwrap_or(&self.base_dir).to_path_buf()
                } else {
                    self.base_dir
                        .join(base_file.parent().unwrap_or(std::path::Path::new("")))
                }
            };

            let resolved_path = base_path.join(name);
            let canonicalized = resolved_path
                .canonicalize()
                .map_err(|_| Error::new_resolving(base, name))?;

            Ok(canonicalized.to_string_lossy().to_string())
        } else {
            // For non-relative imports, return as-is (will be handled by the built-in resolver)
            Err(Error::new_resolving(base, name))
        }
    }
}

/// QuickJS-compatible loader adapter
pub struct QuickJSLoader;

impl Loader for QuickJSLoader {
    fn load<'js>(&mut self, ctx: &Ctx<'js>, name: &str) -> Result<Module<'js, module::Declared>> {
        let path = std::path::Path::new(name);
        if path.exists() && path.is_file() {
            let source = std::fs::read_to_string(path).map_err(|_| Error::new_loading(name))?;

            // Check if the file is a TypeScript file that needs transpilation
            let extension = path.extension().and_then(|ext| ext.to_str());
            let needs_transpilation = matches!(extension, Some("ts") | Some("mts") | Some("cts"));

            if needs_transpilation {
                let transpiled_bytes = transpiler::transpile(source).map_err(|err| {
                    Error::new_loading(&format!("Transpilation failed for {}: {}", name, err))
                })?;
                Module::declare(ctx.clone(), name, transpiled_bytes.as_slice())
            } else {
                Module::declare(ctx.clone(), name, source.as_bytes())
            }
        } else {
            Err(Error::new_loading(name))
        }
    }
}
