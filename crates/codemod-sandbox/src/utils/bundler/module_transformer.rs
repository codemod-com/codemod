use std::collections::HashMap;
use swc_core::{
    common::{SyntaxContext, DUMMY_SP},
    ecma::{
        ast::{
            AssignTarget, Decl, ExportSpecifier, Expr, Ident, IdentName, ImportDecl,
            ImportSpecifier, ModuleDecl, ModuleExportName, ModuleItem, Pat, Stmt, VarDecl,
            VarDeclarator,
        },
        visit::{VisitMut, VisitMutWith},
    },
};

/// SWC visitor for transforming ES6 modules to CommonJS
pub struct ModuleTransformer {
    pub dependency_id_map: HashMap<String, String>,
    pub builtin_variable_map: HashMap<String, String>,
    pub export_assignments: Vec<Stmt>,
}

impl ModuleTransformer {
    pub fn new(
        dependency_id_map: HashMap<String, String>,
        builtin_variable_map: HashMap<String, String>,
    ) -> Self {
        Self {
            dependency_id_map,
            builtin_variable_map,
            export_assignments: Vec::new(),
        }
    }

    fn is_builtin_module(module_path: &str) -> bool {
        module_path.starts_with("codemod:")
    }

    fn create_require_call(&self, module_path: &str) -> Box<Expr> {
        let resolved_id = self
            .dependency_id_map
            .get(module_path)
            .map(|s| s.as_str())
            .unwrap_or(module_path);

        Box::new(Expr::Call(swc_core::ecma::ast::CallExpr {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            callee: swc_core::ecma::ast::Callee::Expr(Box::new(Expr::Ident(Ident::new(
                "require".into(),
                DUMMY_SP,
                SyntaxContext::empty(),
            )))),
            args: vec![swc_core::ecma::ast::ExprOrSpread {
                spread: None,
                expr: Box::new(Expr::Lit(swc_core::ecma::ast::Lit::Str(
                    swc_core::ecma::ast::Str {
                        span: DUMMY_SP,
                        value: resolved_id.into(),
                        raw: None,
                    },
                ))),
            }],
            type_args: None,
        }))
    }

    fn create_module_exports_assignment(&self, name: &str, value: Box<Expr>) -> Stmt {
        Stmt::Expr(swc_core::ecma::ast::ExprStmt {
            span: DUMMY_SP,
            expr: Box::new(Expr::Assign(swc_core::ecma::ast::AssignExpr {
                span: DUMMY_SP,
                op: swc_core::ecma::ast::AssignOp::Assign,
                left: AssignTarget::Simple(swc_core::ecma::ast::SimpleAssignTarget::Member(
                    swc_core::ecma::ast::MemberExpr {
                        span: DUMMY_SP,
                        obj: Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::Ident(Ident::new(
                                "module".into(),
                                DUMMY_SP,
                                SyntaxContext::empty(),
                            ))),
                            prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                                "exports".into(),
                                DUMMY_SP,
                            )),
                        })),
                        prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                            name.into(),
                            DUMMY_SP,
                        )),
                    },
                )),
                right: value,
            })),
        })
    }

    fn transform_import_decl(&self, import: &ImportDecl) -> ModuleItem {
        let module_path = import.src.value.as_str();

        // Transform built-in modules to use pre-imported variables
        if Self::is_builtin_module(module_path) {
            if let Some(builtin_var) = self.builtin_variable_map.get(module_path) {
                return self.transform_builtin_import_decl(import, builtin_var);
            } else {
                // Fallback to keeping import (shouldn't happen)
                return ModuleItem::ModuleDecl(ModuleDecl::Import(import.clone()));
            }
        }

        let require_call = self.create_require_call(module_path);

        // Create variable declarations based on import specifiers
        let mut declarators = Vec::new();

        for spec in &import.specifiers {
            match spec {
                ImportSpecifier::Named(named) => {
                    let imported_name = match &named.imported {
                        Some(ModuleExportName::Ident(ident)) => ident.sym.as_str(),
                        Some(ModuleExportName::Str(str_lit)) => str_lit.value.as_str(),
                        None => named.local.sym.as_str(),
                    };

                    // const { imported_name } = require('module')
                    declarators.push(VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(named.local.clone().into()),
                        init: Some(Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                            span: DUMMY_SP,
                            obj: require_call.clone(),
                            prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                                imported_name.into(),
                                DUMMY_SP,
                            )),
                        }))),
                        definite: false,
                    });
                }
                ImportSpecifier::Default(default) => {
                    // const default_name = require('module').default || require('module')
                    declarators.push(VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(default.local.clone().into()),
                        init: Some(Box::new(Expr::Bin(swc_core::ecma::ast::BinExpr {
                            span: DUMMY_SP,
                            op: swc_core::ecma::ast::BinaryOp::LogicalOr,
                            left: Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                                span: DUMMY_SP,
                                obj: require_call.clone(),
                                prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                                    "default".into(),
                                    DUMMY_SP,
                                )),
                            })),
                            right: require_call.clone(),
                        }))),
                        definite: false,
                    });
                }
                ImportSpecifier::Namespace(namespace) => {
                    // const namespace = require('module')
                    declarators.push(VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(namespace.local.clone().into()),
                        init: Some(require_call.clone()),
                        definite: false,
                    });
                }
            }
        }

        ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            kind: swc_core::ecma::ast::VarDeclKind::Const,
            declare: false,
            decls: declarators,
        }))))
    }

    fn transform_export_named(&self, export: &swc_core::ecma::ast::NamedExport) -> Vec<Stmt> {
        let mut stmts = Vec::new();

        if let Some(src) = &export.src {
            // Re-export from another module
            let require_call = self.create_require_call(src.value.as_str());
            for spec in &export.specifiers {
                if let ExportSpecifier::Named(named) = spec {
                    let exported_name = match &named.exported {
                        Some(ModuleExportName::Ident(ident)) => ident.sym.as_str(),
                        Some(ModuleExportName::Str(str_lit)) => str_lit.value.as_str(),
                        None => {
                            if let ModuleExportName::Ident(ident) = &named.orig {
                                ident.sym.as_str()
                            } else {
                                continue;
                            }
                        }
                    };

                    let orig_name = if let ModuleExportName::Ident(ident) = &named.orig {
                        ident.sym.as_str()
                    } else {
                        continue;
                    };

                    let value = Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                        span: DUMMY_SP,
                        obj: require_call.clone(),
                        prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                            orig_name.into(),
                            DUMMY_SP,
                        )),
                    }));

                    stmts.push(self.create_module_exports_assignment(exported_name, value));
                }
            }
        } else {
            // Export existing variables/functions
            for spec in &export.specifiers {
                if let ExportSpecifier::Named(named) = spec {
                    let exported_name = match &named.exported {
                        Some(ModuleExportName::Ident(ident)) => ident.sym.as_str(),
                        Some(ModuleExportName::Str(str_lit)) => str_lit.value.as_str(),
                        None => {
                            if let ModuleExportName::Ident(ident) = &named.orig {
                                ident.sym.as_str()
                            } else {
                                continue;
                            }
                        }
                    };

                    let orig_name = if let ModuleExportName::Ident(ident) = &named.orig {
                        ident.sym.as_str()
                    } else {
                        continue;
                    };

                    let value = Box::new(Expr::Ident(Ident::new(
                        orig_name.into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    )));
                    stmts.push(self.create_module_exports_assignment(exported_name, value));
                }
            }
        }

        stmts
    }

    /// Transform built-in import declaration to use pre-imported variable
    fn transform_builtin_import_decl(&self, import: &ImportDecl, builtin_var: &str) -> ModuleItem {
        let mut declarators = Vec::new();

        for spec in &import.specifiers {
            match spec {
                ImportSpecifier::Named(named) => {
                    let imported_name = match &named.imported {
                        Some(ModuleExportName::Ident(ident)) => ident.sym.as_str(),
                        Some(ModuleExportName::Str(str_lit)) => str_lit.value.as_str(),
                        None => named.local.sym.as_str(),
                    };

                    // const { imported_name } = __builtin_module
                    declarators.push(VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(named.local.clone().into()),
                        init: Some(Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::Ident(Ident::new(
                                builtin_var.into(),
                                DUMMY_SP,
                                SyntaxContext::empty(),
                            ))),
                            prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                                imported_name.into(),
                                DUMMY_SP,
                            )),
                        }))),
                        definite: false,
                    });
                }
                ImportSpecifier::Default(default) => {
                    // const default_name = __builtin_module.default || __builtin_module
                    declarators.push(VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(default.local.clone().into()),
                        init: Some(Box::new(Expr::Bin(swc_core::ecma::ast::BinExpr {
                            span: DUMMY_SP,
                            op: swc_core::ecma::ast::BinaryOp::LogicalOr,
                            left: Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                                span: DUMMY_SP,
                                obj: Box::new(Expr::Ident(Ident::new(
                                    builtin_var.into(),
                                    DUMMY_SP,
                                    SyntaxContext::empty(),
                                ))),
                                prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                                    "default".into(),
                                    DUMMY_SP,
                                )),
                            })),
                            right: Box::new(Expr::Ident(Ident::new(
                                builtin_var.into(),
                                DUMMY_SP,
                                SyntaxContext::empty(),
                            ))),
                        }))),
                        definite: false,
                    });
                }
                ImportSpecifier::Namespace(namespace) => {
                    // const namespace = __builtin_module
                    declarators.push(VarDeclarator {
                        span: DUMMY_SP,
                        name: Pat::Ident(namespace.local.clone().into()),
                        init: Some(Box::new(Expr::Ident(Ident::new(
                            builtin_var.into(),
                            DUMMY_SP,
                            SyntaxContext::empty(),
                        )))),
                        definite: false,
                    });
                }
            }
        }

        ModuleItem::Stmt(Stmt::Decl(Decl::Var(Box::new(VarDecl {
            span: DUMMY_SP,
            ctxt: SyntaxContext::empty(),
            kind: swc_core::ecma::ast::VarDeclKind::Const,
            declare: false,
            decls: declarators,
        }))))
    }

    fn transform_export_default_decl(
        &self,
        export: &swc_core::ecma::ast::ExportDefaultDecl,
    ) -> (Stmt, Stmt) {
        match &export.decl {
            swc_core::ecma::ast::DefaultDecl::Fn(fn_expr) => {
                let fn_name = fn_expr
                    .ident
                    .as_ref()
                    .map(|id| id.sym.as_str())
                    .unwrap_or("__default");

                let fn_stmt = Stmt::Decl(Decl::Fn(swc_core::ecma::ast::FnDecl {
                    ident: Ident::new(fn_name.into(), DUMMY_SP, SyntaxContext::empty()),
                    declare: false,
                    function: fn_expr.function.clone(),
                }));

                let export_stmt = self.create_module_exports_assignment(
                    "default",
                    Box::new(Expr::Ident(Ident::new(
                        fn_name.into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    ))),
                );

                (fn_stmt, export_stmt)
            }
            swc_core::ecma::ast::DefaultDecl::Class(class_expr) => {
                let class_name = class_expr
                    .ident
                    .as_ref()
                    .map(|id| id.sym.as_str())
                    .unwrap_or("__default");

                let class_stmt = Stmt::Decl(Decl::Class(swc_core::ecma::ast::ClassDecl {
                    ident: Ident::new(class_name.into(), DUMMY_SP, SyntaxContext::empty()),
                    declare: false,
                    class: class_expr.class.clone(),
                }));

                let export_stmt = self.create_module_exports_assignment(
                    "default",
                    Box::new(Expr::Ident(Ident::new(
                        class_name.into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    ))),
                );

                (class_stmt, export_stmt)
            }
            swc_core::ecma::ast::DefaultDecl::TsInterfaceDecl(_) => {
                // TypeScript interfaces don't exist at runtime
                (
                    Stmt::Empty(swc_core::ecma::ast::EmptyStmt { span: DUMMY_SP }),
                    Stmt::Empty(swc_core::ecma::ast::EmptyStmt { span: DUMMY_SP }),
                )
            }
        }
    }

    fn transform_export_default_expr(
        &self,
        export: &swc_core::ecma::ast::ExportDefaultExpr,
    ) -> Stmt {
        self.create_module_exports_assignment("default", export.expr.clone())
    }

    fn transform_export_decl(&self, export: &swc_core::ecma::ast::ExportDecl) -> (Stmt, Stmt) {
        match &export.decl {
            Decl::Var(var_decl) => {
                let mut export_stmts = Vec::new();
                for decl in &var_decl.decls {
                    if let Pat::Ident(ident) = &decl.name {
                        let name = ident.id.sym.as_str();
                        export_stmts.push(self.create_module_exports_assignment(
                            name,
                            Box::new(Expr::Ident(Ident::new(
                                name.into(),
                                DUMMY_SP,
                                SyntaxContext::empty(),
                            ))),
                        ));
                    }
                }

                let mut var_decl_clone = var_decl.clone();
                var_decl_clone.ctxt = SyntaxContext::empty();
                let var_stmt = Stmt::Decl(Decl::Var(var_decl_clone));
                // Return the first export statement, others will be handled elsewhere
                let export_stmt = export_stmts.into_iter().next().unwrap_or_else(|| {
                    Stmt::Empty(swc_core::ecma::ast::EmptyStmt { span: DUMMY_SP })
                });

                (var_stmt, export_stmt)
            }
            Decl::Fn(fn_decl) => {
                let name = fn_decl.ident.sym.as_str();
                let fn_stmt = Stmt::Decl(Decl::Fn(fn_decl.clone()));
                let export_stmt = self.create_module_exports_assignment(
                    name,
                    Box::new(Expr::Ident(Ident::new(
                        name.into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    ))),
                );

                (fn_stmt, export_stmt)
            }
            Decl::Class(class_decl) => {
                let name = class_decl.ident.sym.as_str();
                let class_stmt = Stmt::Decl(Decl::Class(class_decl.clone()));
                let export_stmt = self.create_module_exports_assignment(
                    name,
                    Box::new(Expr::Ident(Ident::new(
                        name.into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    ))),
                );

                (class_stmt, export_stmt)
            }
            _ => (
                Stmt::Decl(export.decl.clone()),
                Stmt::Empty(swc_core::ecma::ast::EmptyStmt { span: DUMMY_SP }),
            ),
        }
    }

    fn transform_export_all(&self, export_all: &swc_core::ecma::ast::ExportAll) -> Stmt {
        let require_call = self.create_require_call(export_all.src.value.as_str());

        // Object.assign(module.exports, require('module'))
        Stmt::Expr(swc_core::ecma::ast::ExprStmt {
            span: DUMMY_SP,
            expr: Box::new(Expr::Call(swc_core::ecma::ast::CallExpr {
                span: DUMMY_SP,
                ctxt: SyntaxContext::empty(),
                callee: swc_core::ecma::ast::Callee::Expr(Box::new(Expr::Member(
                    swc_core::ecma::ast::MemberExpr {
                        span: DUMMY_SP,
                        obj: Box::new(Expr::Ident(Ident::new(
                            "Object".into(),
                            DUMMY_SP,
                            SyntaxContext::empty(),
                        ))),
                        prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                            "assign".into(),
                            DUMMY_SP,
                        )),
                    },
                ))),
                args: vec![
                    swc_core::ecma::ast::ExprOrSpread {
                        spread: None,
                        expr: Box::new(Expr::Member(swc_core::ecma::ast::MemberExpr {
                            span: DUMMY_SP,
                            obj: Box::new(Expr::Ident(Ident::new(
                                "module".into(),
                                DUMMY_SP,
                                SyntaxContext::empty(),
                            ))),
                            prop: swc_core::ecma::ast::MemberProp::Ident(IdentName::new(
                                "exports".into(),
                                DUMMY_SP,
                            )),
                        })),
                    },
                    swc_core::ecma::ast::ExprOrSpread {
                        spread: None,
                        expr: require_call,
                    },
                ],
                type_args: None,
            })),
        })
    }
}

impl VisitMut for ModuleTransformer {
    fn visit_mut_module_item(&mut self, item: &mut ModuleItem) {
        if let ModuleItem::ModuleDecl(decl) = item {
            match decl {
                ModuleDecl::Import(import_decl) => {
                    *item = self.transform_import_decl(import_decl);
                }
                ModuleDecl::ExportNamed(export) => {
                    let stmts = self.transform_export_named(export);
                    if !stmts.is_empty() {
                        *item = ModuleItem::Stmt(stmts[0].clone());
                        // Store additional statements for later
                        for stmt in stmts.into_iter().skip(1) {
                            self.export_assignments.push(stmt);
                        }
                    } else {
                        // Remove the export statement
                        *item = ModuleItem::Stmt(Stmt::Empty(swc_core::ecma::ast::EmptyStmt {
                            span: DUMMY_SP,
                        }));
                    }
                }
                ModuleDecl::ExportDefaultDecl(export) => {
                    let (stmt, export_stmt) = self.transform_export_default_decl(export);
                    *item = ModuleItem::Stmt(stmt);
                    self.export_assignments.push(export_stmt);
                }
                ModuleDecl::ExportDefaultExpr(export) => {
                    let stmt = self.transform_export_default_expr(export);
                    *item = ModuleItem::Stmt(stmt);
                }
                ModuleDecl::ExportDecl(export) => {
                    let (stmt, export_stmt) = self.transform_export_decl(export);
                    *item = ModuleItem::Stmt(stmt);
                    self.export_assignments.push(export_stmt);
                }
                ModuleDecl::ExportAll(export_all) => {
                    let stmt = self.transform_export_all(export_all);
                    *item = ModuleItem::Stmt(stmt);
                }
                _ => {}
            }
        }

        item.visit_mut_children_with(self);
    }
}
