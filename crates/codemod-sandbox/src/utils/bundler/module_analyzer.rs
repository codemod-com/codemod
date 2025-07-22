use swc_core::ecma::{
    ast::{Decl, ExportSpecifier, ModuleDecl, ModuleExportName, ModuleItem, Pat},
    visit::{Visit, VisitWith},
};

/// Information about module exports
#[derive(Debug, Clone, Default)]
pub struct ModuleExports {
    /// Named exports
    pub named: Vec<String>,
    /// Default export exists
    pub has_default: bool,
    /// Namespace export exists
    pub has_namespace: bool,
}

/// SWC visitor to analyze imports and exports
pub(crate) struct ModuleAnalyzer {
    pub(crate) dependencies: Vec<String>,
    pub(crate) exports: ModuleExports,
}

impl ModuleAnalyzer {
    pub(crate) fn new() -> Self {
        Self {
            dependencies: Vec::new(),
            exports: ModuleExports::default(),
        }
    }
}

impl Visit for ModuleAnalyzer {
    fn visit_module_item(&mut self, item: &ModuleItem) {
        if let ModuleItem::ModuleDecl(decl) = item {
            match decl {
                ModuleDecl::Import(import_decl) => {
                    self.dependencies.push(import_decl.src.value.to_string());
                }
                ModuleDecl::ExportNamed(export) => {
                    if let Some(src) = &export.src {
                        self.dependencies.push(src.value.to_string());
                    }
                    for spec in &export.specifiers {
                        if let Some(name) = self.extract_export_name(spec) {
                            self.exports.named.push(name);
                        }
                    }
                }
                ModuleDecl::ExportDefaultDecl(_) | ModuleDecl::ExportDefaultExpr(_) => {
                    self.exports.has_default = true;
                }
                ModuleDecl::ExportAll(export_all) => {
                    self.dependencies.push(export_all.src.value.to_string());
                    self.exports.has_namespace = true;
                }
                ModuleDecl::ExportDecl(export_decl) => {
                    // Handle export declarations (export const x = ...)
                    match &export_decl.decl {
                        Decl::Var(var_decl) => {
                            for decl in &var_decl.decls {
                                if let Pat::Ident(ident) = &decl.name {
                                    self.exports.named.push(ident.id.sym.to_string());
                                }
                            }
                        }
                        Decl::Fn(fn_decl) => {
                            self.exports.named.push(fn_decl.ident.sym.to_string());
                        }
                        Decl::Class(class_decl) => {
                            self.exports.named.push(class_decl.ident.sym.to_string());
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        }

        item.visit_children_with(self);
    }
}

impl ModuleAnalyzer {
    pub(crate) fn extract_export_name(&self, spec: &ExportSpecifier) -> Option<String> {
        match spec {
            ExportSpecifier::Named(named) => match &named.exported {
                Some(ModuleExportName::Ident(ident)) => Some(ident.sym.to_string()),
                Some(ModuleExportName::Str(str_lit)) => Some(str_lit.value.to_string()),
                None => {
                    if let ModuleExportName::Ident(ident) = &named.orig {
                        Some(ident.sym.to_string())
                    } else {
                        None
                    }
                }
            },
            ExportSpecifier::Default(_) => {
                // Default export
                None
            }
            ExportSpecifier::Namespace(ns) => match &ns.name {
                ModuleExportName::Ident(ident) => Some(ident.sym.to_string()),
                ModuleExportName::Str(str_lit) => Some(str_lit.value.to_string()),
            },
        }
    }
}
