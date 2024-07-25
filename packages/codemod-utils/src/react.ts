import type {
  ASTPath,
  ClassDeclaration,
  Collection,
  JSCodeshift,
} from "jscodeshift";
import { type FunctionLike, getFunctionName } from "./function.js";
import { getImportDeclaration } from "./global.js";
import { getImportDeclarationNames } from "./importDeclaration.js";

/**
 * Checks if a string is capitalized.
 *
 * @param str - The string to check.
 * @returns A boolean indicating whether the string is capitalized.
 */
const isCapitalized = (str: string): boolean => {
  if (str.length === 0) {
    return false;
  }

  const firstChar = str.charAt(0);
  return firstChar === firstChar.toUpperCase();
};

/**
 * Retrieves all React class components from the root Collection.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param root - The root Collection representing the AST of the source code.
 * @returns A Collection of ClassDeclaration nodes representing React class components, or null if no React import is found.
 */
export const getClassComponents = (
  j: JSCodeshift,
  root: Collection<any>,
): Collection<ClassDeclaration> | null => {
  const importDeclaration = getImportDeclaration(j, root, "react");

  if (!importDeclaration) {
    return null;
  }

  const {
    importNamespaceSpecifierName,
    importDefaultSpecifierName,
    importSpecifierLocalNames,
  } = getImportDeclarationNames(j, importDeclaration);

  const REACT_CLASS_COMPONENT_SUPERCLASS_NAMES = ["PureComponent", "Component"];

  const importedComponentSuperclassNames =
    REACT_CLASS_COMPONENT_SUPERCLASS_NAMES.map((name) =>
      importSpecifierLocalNames.get(name),
    ).filter(Boolean);

  const importedModuleName =
    importNamespaceSpecifierName ?? importDefaultSpecifierName;

  return root.find(j.ClassDeclaration).filter((path) => {
    const superClass = path.value.superClass;

    if (
      j.Identifier.check(superClass) &&
      importedComponentSuperclassNames.includes(superClass.name)
    ) {
      return true;
    }

    if (
      j.MemberExpression.check(superClass) &&
      j.Identifier.check(superClass.object) &&
      superClass.object.name === importedModuleName &&
      j.Identifier.check(superClass.property) &&
      REACT_CLASS_COMPONENT_SUPERCLASS_NAMES.includes(superClass.property.name)
    ) {
      return true;
    }

    return false;
  });
};

/**
 * Retrieves all function components from the root Collection.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param root - The root Collection representing the AST of the source code.
 * @returns An array of ASTPath nodes representing function components.
 */
export const getFunctionComponents = (j: JSCodeshift, root: Collection) => {
  const functionLikePaths: ASTPath<FunctionLike>[] = [
    ...root.find(j.FunctionDeclaration).paths(),
    ...root.find(j.FunctionExpression).paths(),
    ...root.find(j.ArrowFunctionExpression).paths(),
  ];

  return functionLikePaths.filter((path) => isReactFunctionComponent(j, path));
};

/**
 * Checks if a given FunctionLike node is a React function component.
 *
 * @param j - The JSCodeshift API object used for AST manipulation.
 * @param maybeComponent - The ASTPath of the FunctionLike node to check.
 * @returns A boolean indicating whether the node is a React function component.
 */
export const isReactFunctionComponent = (
  j: JSCodeshift,
  maybeComponent: ASTPath<FunctionLike>,
) => {
  const name = getFunctionName(j, maybeComponent);

  // @TODO
  return name && isCapitalized(name);
};
