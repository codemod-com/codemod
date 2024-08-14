import type {
  ASTPath,
  ClassDeclaration,
  ClassMethod,
  ClassProperty,
  JSCodeshift,
} from "jscodeshift";

/**
 * Retrieves a class method from a class declaration by its name.
 *
 * @param j - The JSCodeshift instance.
 * @param klass - The AST path of the class declaration.
 * @param name - The name of the class method to retrieve.
 * @returns The AST path of the class method, or `null` if not found.
 */
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

/**
 * Retrieves a class property from a class declaration by its name.
 *
 * @param j - The JSCodeshift instance.
 * @param klass - The AST path of the class declaration.
 * @param name - The name of the class property to retrieve.
 * @returns The AST path of the class property, or `null` if not found.
 */
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
