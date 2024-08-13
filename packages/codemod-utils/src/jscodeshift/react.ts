import type {
  ASTPath,
  ClassDeclaration,
  Collection,
  JSCodeshift,
} from "jscodeshift";

import { type FunctionLike, getFunctionName } from "./function.js";
import { getImportDeclaration } from "./global.js";
import { getImportDeclarationNames } from "./import-declaration.js";


const isCapitalized = (str: string): boolean => {
  if (str.length === 0) {
    return false;
  }

  const firstChar = str.charAt(0);
  return firstChar === firstChar.toUpperCase();
};

/**
 * Finds all React class components in the given AST.
 *
 * @param j - The JSCodeshift instance.
 * @param root - The root of the AST to search.
 * @returns A collection of all React class components found in the AST, or `null` if no React import declaration was found.
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
 * Finds all React function components in the given AST.
 *
 * @param j - The JSCodeshift instance.
 * @param root - The root of the AST to search.
 * @returns A collection of all React function components found in the AST.
 */
export const getFunctionComponents = (j: JSCodeshift, root: Collection) => {
  const functionLikePaths: ASTPath<FunctionLike>[] = [
    ...root.find(j.FunctionDeclaration).paths(),
    ...root.find(j.FunctionExpression).paths(),
    ...root.find(j.ArrowFunctionExpression).paths(),
  ];

  return j(
    functionLikePaths.filter((path) => isReactFunctionComponent(j, path)),
  );
};

/**
 * Determines if the given function-like AST node represents a React function component.
 *
 * @param j - The JSCodeshift instance.
 * @param maybeComponent - The function-like AST node to check.
 * @returns `true` if the function-like node represents a React function component, `false` otherwise.
 */
export const isReactFunctionComponent = (
  j: JSCodeshift,
  maybeComponent: ASTPath<FunctionLike>,
) => {
  const name = getFunctionName(j, maybeComponent);

  // @TODO
  return name && isCapitalized(name);
};
