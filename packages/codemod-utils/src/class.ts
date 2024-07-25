import type {
  ASTPath,
  ClassDeclaration,
  ClassMethod,
  ClassProperty,
  JSCodeshift,
} from "jscodeshift";

export const getClassMethod = (
  j: JSCodeshift,
  klass: ASTPath<ClassDeclaration>,
  name: string,
): ASTPath<ClassMethod> | null =>
  j(klass)
    .find(j.ClassMethod, {
      key: {
        type: "Identifier",
        name,
      },
    })
    .paths()
    .at(0) ?? null;

export const getClassProperty = (
  j: JSCodeshift,
  klass: ASTPath<ClassDeclaration>,
  name: string,
): ASTPath<ClassProperty> | null =>
  j(klass)
    .find(j.ClassProperty, {
      key: {
        type: "Identifier",
        name,
      },
    })
    .paths()
    .at(0) ?? null;
