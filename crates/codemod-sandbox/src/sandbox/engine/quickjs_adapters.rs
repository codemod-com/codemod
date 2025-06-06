use rquickjs_git::{
    loader::{Loader, Resolver},
    Ctx, Error, Module,
};
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
    fn resolve(&mut self, _ctx: &Ctx<'_>, base: &str, name: &str) -> rquickjs_git::Result<String> {
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
    fn load<'js>(
        &mut self,
        ctx: &Ctx<'js>,
        name: &str,
    ) -> rquickjs_git::Result<Module<'js, rquickjs_git::module::Declared>> {
        let path = std::path::Path::new(name);
        if path.exists() && path.is_file() {
            let source = std::fs::read_to_string(path).map_err(|_| Error::new_loading(name))?;
            Module::declare(ctx.clone(), name, source.as_bytes())
        } else {
            Err(Error::new_loading(name))
        }
    }
}
