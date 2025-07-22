#[cfg(test)]
mod tests {
    use super::super::module_transformer::ModuleTransformer;
    use std::collections::HashMap;
    use swc_core::{
        common::{SyntaxContext, DUMMY_SP},
        ecma::ast::{
            AssignTarget, ExportAll, ExportDefaultExpr, ExportSpecifier, Expr, Ident, ImportDecl,
            ImportDefaultSpecifier, ImportNamedSpecifier, ImportSpecifier, ImportStarAsSpecifier,
            ModuleExportName, ModuleItem, NamedExport, Pat, Stmt, Str, VarDeclKind,
        },
    };

    fn create_test_transformer() -> ModuleTransformer {
        let mut dependency_map = HashMap::new();
        dependency_map.insert("react".to_string(), "__dep_0".to_string());
        dependency_map.insert("lodash".to_string(), "__dep_1".to_string());

        ModuleTransformer::new(dependency_map)
    }

    fn create_import_decl(src: &str, specifiers: Vec<ImportSpecifier>) -> ImportDecl {
        ImportDecl {
            span: DUMMY_SP,
            specifiers,
            src: Box::new(Str {
                span: DUMMY_SP,
                value: src.into(),
                raw: None,
            }),
            type_only: false,
            with: None,
            phase: Default::default(),
        }
    }

    fn create_named_import(local_name: &str, imported_name: Option<&str>) -> ImportSpecifier {
        ImportSpecifier::Named(ImportNamedSpecifier {
            span: DUMMY_SP,
            local: Ident::new(local_name.into(), DUMMY_SP, SyntaxContext::empty()),
            imported: imported_name.map(|name| {
                ModuleExportName::Ident(Ident::new(name.into(), DUMMY_SP, SyntaxContext::empty()))
            }),
            is_type_only: false,
        })
    }

    fn create_default_import(local_name: &str) -> ImportSpecifier {
        ImportSpecifier::Default(ImportDefaultSpecifier {
            span: DUMMY_SP,
            local: Ident::new(local_name.into(), DUMMY_SP, SyntaxContext::empty()),
        })
    }

    fn create_namespace_import(local_name: &str) -> ImportSpecifier {
        ImportSpecifier::Namespace(ImportStarAsSpecifier {
            span: DUMMY_SP,
            local: Ident::new(local_name.into(), DUMMY_SP, SyntaxContext::empty()),
        })
    }

    #[test]
    fn test_new_module_transformer() {
        let mut dependency_map = HashMap::new();
        dependency_map.insert("react".to_string(), "__dep_0".to_string());

        let transformer = ModuleTransformer::new(dependency_map.clone());

        assert_eq!(transformer.dependency_id_map, dependency_map);
        assert!(transformer.export_assignments.is_empty());
    }

    #[test]
    fn test_create_require_call_with_dependency_mapping() {
        let transformer = create_test_transformer();
        let require_call = transformer.create_require_call("react");

        // The require call should use the mapped dependency ID
        if let Expr::Call(call_expr) = require_call.as_ref() {
            assert_eq!(call_expr.args.len(), 1);
            if let Expr::Lit(swc_core::ecma::ast::Lit::Str(str_lit)) =
                call_expr.args[0].expr.as_ref()
            {
                assert_eq!(str_lit.value.as_str(), "__dep_0");
            } else {
                panic!("Expected string literal argument");
            }
        } else {
            panic!("Expected call expression");
        }
    }

    #[test]
    fn test_create_require_call_without_dependency_mapping() {
        let transformer = create_test_transformer();
        let require_call = transformer.create_require_call("unknown-module");

        // The require call should use the original module path
        if let Expr::Call(call_expr) = require_call.as_ref() {
            if let Expr::Lit(swc_core::ecma::ast::Lit::Str(str_lit)) =
                call_expr.args[0].expr.as_ref()
            {
                assert_eq!(str_lit.value.as_str(), "unknown-module");
            } else {
                panic!("Expected string literal argument");
            }
        } else {
            panic!("Expected call expression");
        }
    }

    #[test]
    fn test_transform_named_import() {
        let transformer = create_test_transformer();
        let import_decl = create_import_decl(
            "react",
            vec![
                create_named_import("useState", None),
                create_named_import("useEffect", None),
            ],
        );

        let result = transformer.transform_import_decl(&import_decl);

        if let ModuleItem::Stmt(Stmt::Decl(swc_core::ecma::ast::Decl::Var(var_decl))) = result {
            assert_eq!(var_decl.kind, VarDeclKind::Const);
            assert_eq!(var_decl.decls.len(), 2);

            // Check first declaration
            if let Pat::Ident(ident) = &var_decl.decls[0].name {
                assert_eq!(ident.id.sym.as_str(), "useState");
            } else {
                panic!("Expected identifier pattern");
            }

            // Check second declaration
            if let Pat::Ident(ident) = &var_decl.decls[1].name {
                assert_eq!(ident.id.sym.as_str(), "useEffect");
            } else {
                panic!("Expected identifier pattern");
            }
        } else {
            panic!("Expected variable declaration");
        }
    }

    #[test]
    fn test_transform_named_import_with_alias() {
        let transformer = create_test_transformer();
        let import_decl = create_import_decl(
            "react",
            vec![create_named_import("localName", Some("useState"))],
        );

        let result = transformer.transform_import_decl(&import_decl);

        if let ModuleItem::Stmt(Stmt::Decl(swc_core::ecma::ast::Decl::Var(var_decl))) = result {
            assert_eq!(var_decl.decls.len(), 1);
            if let Pat::Ident(ident) = &var_decl.decls[0].name {
                assert_eq!(ident.id.sym.as_str(), "localName");
            } else {
                panic!("Expected identifier pattern");
            }
        } else {
            panic!("Expected variable declaration");
        }
    }

    #[test]
    fn test_transform_default_import() {
        let transformer = create_test_transformer();
        let import_decl = create_import_decl("react", vec![create_default_import("React")]);

        let result = transformer.transform_import_decl(&import_decl);

        if let ModuleItem::Stmt(Stmt::Decl(swc_core::ecma::ast::Decl::Var(var_decl))) = result {
            assert_eq!(var_decl.decls.len(), 1);
            if let Pat::Ident(ident) = &var_decl.decls[0].name {
                assert_eq!(ident.id.sym.as_str(), "React");
            } else {
                panic!("Expected identifier pattern");
            }

            // The init should be a binary expression (require().default || require())
            if let Some(init) = &var_decl.decls[0].init {
                if let Expr::Bin(bin_expr) = init.as_ref() {
                    assert!(matches!(
                        bin_expr.op,
                        swc_core::ecma::ast::BinaryOp::LogicalOr
                    ));
                } else {
                    panic!("Expected binary expression");
                }
            } else {
                panic!("Expected init expression");
            }
        } else {
            panic!("Expected variable declaration");
        }
    }

    #[test]
    fn test_transform_namespace_import() {
        let transformer = create_test_transformer();
        let import_decl = create_import_decl("react", vec![create_namespace_import("React")]);

        let result = transformer.transform_import_decl(&import_decl);

        if let ModuleItem::Stmt(Stmt::Decl(swc_core::ecma::ast::Decl::Var(var_decl))) = result {
            assert_eq!(var_decl.decls.len(), 1);
            if let Pat::Ident(ident) = &var_decl.decls[0].name {
                assert_eq!(ident.id.sym.as_str(), "React");
            } else {
                panic!("Expected identifier pattern");
            }
        } else {
            panic!("Expected variable declaration");
        }
    }

    #[test]
    fn test_transform_mixed_import() {
        let transformer = create_test_transformer();
        let import_decl = create_import_decl(
            "react",
            vec![
                create_default_import("React"),
                create_named_import("useState", None),
                create_named_import("Component", None),
            ],
        );

        let result = transformer.transform_import_decl(&import_decl);

        if let ModuleItem::Stmt(Stmt::Decl(swc_core::ecma::ast::Decl::Var(var_decl))) = result {
            assert_eq!(var_decl.decls.len(), 3);
        } else {
            panic!("Expected variable declaration");
        }
    }

    #[test]
    fn test_transform_export_named_local() {
        let transformer = create_test_transformer();
        let export = NamedExport {
            span: DUMMY_SP,
            specifiers: vec![ExportSpecifier::Named(
                swc_core::ecma::ast::ExportNamedSpecifier {
                    span: DUMMY_SP,
                    orig: ModuleExportName::Ident(Ident::new(
                        "localVar".into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    )),
                    exported: None,
                    is_type_only: false,
                },
            )],
            src: None,
            type_only: false,
            with: None,
        };

        let stmts = transformer.transform_export_named(&export);

        assert_eq!(stmts.len(), 1);
        // Should create module.exports.localVar = localVar
        if let Stmt::Expr(expr_stmt) = &stmts[0] {
            if let Expr::Assign(assign_expr) = expr_stmt.expr.as_ref() {
                // Check that it's assigning to module.exports.localVar
                if let AssignTarget::Simple(swc_core::ecma::ast::SimpleAssignTarget::Member(
                    member_expr,
                )) = &assign_expr.left
                {
                    if let swc_core::ecma::ast::MemberProp::Ident(prop) = &member_expr.prop {
                        assert_eq!(prop.sym.as_str(), "localVar");
                    } else {
                        panic!("Expected property identifier");
                    }
                } else {
                    panic!("Expected member expression");
                }
            } else {
                panic!("Expected assignment expression");
            }
        } else {
            panic!("Expected expression statement");
        }
    }

    #[test]
    fn test_transform_export_named_with_alias() {
        let transformer = create_test_transformer();
        let export = NamedExport {
            span: DUMMY_SP,
            specifiers: vec![ExportSpecifier::Named(
                swc_core::ecma::ast::ExportNamedSpecifier {
                    span: DUMMY_SP,
                    orig: ModuleExportName::Ident(Ident::new(
                        "localVar".into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    )),
                    exported: Some(ModuleExportName::Ident(Ident::new(
                        "exportedName".into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    ))),
                    is_type_only: false,
                },
            )],
            src: None,
            type_only: false,
            with: None,
        };

        let stmts = transformer.transform_export_named(&export);

        assert_eq!(stmts.len(), 1);
        // Should create module.exports.exportedName = localVar
        if let Stmt::Expr(expr_stmt) = &stmts[0] {
            if let Expr::Assign(assign_expr) = expr_stmt.expr.as_ref() {
                if let AssignTarget::Simple(swc_core::ecma::ast::SimpleAssignTarget::Member(
                    member_expr,
                )) = &assign_expr.left
                {
                    if let swc_core::ecma::ast::MemberProp::Ident(prop) = &member_expr.prop {
                        assert_eq!(prop.sym.as_str(), "exportedName");
                    } else {
                        panic!("Expected property identifier");
                    }
                } else {
                    panic!("Expected member expression");
                }
            } else {
                panic!("Expected assignment expression");
            }
        } else {
            panic!("Expected expression statement");
        }
    }

    #[test]
    fn test_transform_export_named_re_export() {
        let transformer = create_test_transformer();
        let export = NamedExport {
            span: DUMMY_SP,
            specifiers: vec![ExportSpecifier::Named(
                swc_core::ecma::ast::ExportNamedSpecifier {
                    span: DUMMY_SP,
                    orig: ModuleExportName::Ident(Ident::new(
                        "useState".into(),
                        DUMMY_SP,
                        SyntaxContext::empty(),
                    )),
                    exported: None,
                    is_type_only: false,
                },
            )],
            src: Some(Box::new(Str {
                span: DUMMY_SP,
                value: "react".into(),
                raw: None,
            })),
            type_only: false,
            with: None,
        };

        let stmts = transformer.transform_export_named(&export);

        assert_eq!(stmts.len(), 1);
        // Should create module.exports.useState = require('react').useState
        if let Stmt::Expr(expr_stmt) = &stmts[0] {
            if let Expr::Assign(assign_expr) = expr_stmt.expr.as_ref() {
                // Right side should be a member expression accessing the required module
                if let Expr::Member(_member_expr) = assign_expr.right.as_ref() {
                    // This is expected
                } else {
                    panic!("Expected member expression on right side");
                }
            } else {
                panic!("Expected assignment expression");
            }
        } else {
            panic!("Expected expression statement");
        }
    }

    #[test]
    fn test_transform_export_all() {
        let transformer = create_test_transformer();
        let export_all = ExportAll {
            span: DUMMY_SP,
            src: Box::new(Str {
                span: DUMMY_SP,
                value: "react".into(),
                raw: None,
            }),
            type_only: false,
            with: None,
        };

        let stmt = transformer.transform_export_all(&export_all);

        // Should create Object.assign(module.exports, require('react'))
        if let Stmt::Expr(expr_stmt) = stmt {
            if let Expr::Call(call_expr) = expr_stmt.expr.as_ref() {
                assert_eq!(call_expr.args.len(), 2);
                // First argument should be module.exports
                // Second argument should be require('react')
            } else {
                panic!("Expected call expression");
            }
        } else {
            panic!("Expected expression statement");
        }
    }

    #[test]
    fn test_transform_export_default_expression() {
        let transformer = create_test_transformer();
        let export = ExportDefaultExpr {
            span: DUMMY_SP,
            expr: Box::new(Expr::Ident(Ident::new(
                "myVar".into(),
                DUMMY_SP,
                SyntaxContext::empty(),
            ))),
        };

        let stmt = transformer.transform_export_default_expr(&export);

        // Should create module.exports.default = myVar
        if let Stmt::Expr(expr_stmt) = stmt {
            if let Expr::Assign(assign_expr) = expr_stmt.expr.as_ref() {
                if let AssignTarget::Simple(swc_core::ecma::ast::SimpleAssignTarget::Member(
                    member_expr,
                )) = &assign_expr.left
                {
                    if let swc_core::ecma::ast::MemberProp::Ident(prop) = &member_expr.prop {
                        assert_eq!(prop.sym.as_str(), "default");
                    } else {
                        panic!("Expected 'default' property");
                    }
                } else {
                    panic!("Expected member expression");
                }

                if let Expr::Ident(ident) = assign_expr.right.as_ref() {
                    assert_eq!(ident.sym.as_str(), "myVar");
                } else {
                    panic!("Expected identifier on right side");
                }
            } else {
                panic!("Expected assignment expression");
            }
        } else {
            panic!("Expected expression statement");
        }
    }

    #[test]
    fn test_create_module_exports_assignment() {
        let transformer = create_test_transformer();
        let value = Box::new(Expr::Ident(Ident::new(
            "myVar".into(),
            DUMMY_SP,
            SyntaxContext::empty(),
        )));
        let stmt = transformer.create_module_exports_assignment("exportName", value);

        if let Stmt::Expr(expr_stmt) = stmt {
            if let Expr::Assign(assign_expr) = expr_stmt.expr.as_ref() {
                // Check left side: module.exports.exportName
                if let AssignTarget::Simple(swc_core::ecma::ast::SimpleAssignTarget::Member(
                    member_expr,
                )) = &assign_expr.left
                {
                    if let Expr::Member(parent_member) = member_expr.obj.as_ref() {
                        if let Expr::Ident(module_ident) = parent_member.obj.as_ref() {
                            assert_eq!(module_ident.sym.as_str(), "module");
                        } else {
                            panic!("Expected 'module' identifier");
                        }
                        if let swc_core::ecma::ast::MemberProp::Ident(exports_prop) =
                            &parent_member.prop
                        {
                            assert_eq!(exports_prop.sym.as_str(), "exports");
                        } else {
                            panic!("Expected 'exports' property");
                        }
                    } else {
                        panic!("Expected member expression for module.exports");
                    }
                    if let swc_core::ecma::ast::MemberProp::Ident(prop) = &member_expr.prop {
                        assert_eq!(prop.sym.as_str(), "exportName");
                    } else {
                        panic!("Expected 'exportName' property");
                    }
                } else {
                    panic!("Expected member expression");
                }

                // Check right side: myVar
                if let Expr::Ident(ident) = assign_expr.right.as_ref() {
                    assert_eq!(ident.sym.as_str(), "myVar");
                } else {
                    panic!("Expected identifier on right side");
                }
            } else {
                panic!("Expected assignment expression");
            }
        } else {
            panic!("Expected expression statement");
        }
    }

    #[test]
    fn test_empty_import_specifiers() {
        let transformer = create_test_transformer();
        let import_decl = create_import_decl("react", vec![]);

        let result = transformer.transform_import_decl(&import_decl);

        if let ModuleItem::Stmt(Stmt::Decl(swc_core::ecma::ast::Decl::Var(var_decl))) = result {
            assert!(var_decl.decls.is_empty());
        } else {
            panic!("Expected variable declaration");
        }
    }

    #[test]
    fn test_empty_export_specifiers() {
        let transformer = create_test_transformer();
        let export = NamedExport {
            span: DUMMY_SP,
            specifiers: vec![],
            src: None,
            type_only: false,
            with: None,
        };

        let stmts = transformer.transform_export_named(&export);
        assert!(stmts.is_empty());
    }
}
