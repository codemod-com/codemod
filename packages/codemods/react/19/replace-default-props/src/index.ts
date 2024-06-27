// BUILT WITH https://codemod.studio

import type {
  API,
  ASTPath,
  ArrowFunctionExpression,
  Collection,
  FileInfo,
  FunctionDeclaration,
  FunctionExpression,
  JSCodeshift,
  MemberExpression,
  ObjectProperty,
  ReturnStatement,
} from "jscodeshift";

const analyzeImportedModule = (
  j: JSCodeshift,
  root: Collection,
  source: string,
) => {
  const importSpecifierLocalNames = new Map<string, string>();

  let importDefaultSpecifierName: string | null = null;
  let importNamespaceSpecifierName: string | null = null;

  root
    .find(j.ImportDeclaration, {
      source: { value: source },
    })
    .forEach((path) => {
      path.value.specifiers?.forEach((specifier) => {
        if (j.ImportSpecifier.check(specifier)) {
          importSpecifierLocalNames.set(
            specifier.imported.name,
            specifier.local?.name ?? "",
          );
        }

        if (j.ImportDefaultSpecifier.check(specifier) && specifier.local) {
          importDefaultSpecifierName = specifier.local.name;
        }

        if (j.ImportNamespaceSpecifier.check(specifier) && specifier.local) {
          importNamespaceSpecifierName = specifier.local.name;
        }
      });
    });

  return {
    importSpecifierLocalNames,
    importDefaultSpecifierName,
    importNamespaceSpecifierName,
  };
};

export const getCallExpressionsByImport = (
  j: JSCodeshift,
  root: Collection<any>,
  source: string,
) => {
  const {
    importNamespaceSpecifierName,
    importDefaultSpecifierName,
    importSpecifierLocalNames,
  } = analyzeImportedModule(j, root, source);

  const importedModuleName =
    importNamespaceSpecifierName ?? importDefaultSpecifierName;

  return root.find(j.CallExpression).filter((path) => {
    const { callee } = path.value;

    if (
      j.Identifier.check(callee) &&
      importSpecifierLocalNames.has(callee.name)
    ) {
      return true;
    }

    if (
      j.MemberExpression.check(callee) &&
      j.Identifier.check(callee.object) &&
      callee.object.name === importedModuleName &&
      j.Identifier.check(callee.property)
    ) {
      return true;
    }

    return false;
  });
};

export const getClassComponents = (j: JSCodeshift, root: Collection<any>) => {
  const {
    importNamespaceSpecifierName,
    importDefaultSpecifierName,
    importSpecifierLocalNames,
  } = analyzeImportedModule(j, root, "react");

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
      importedComponentSuperclassNames.includes(superClass.property.name)
    ) {
      return true;
    }

    return false;
  });
};

const isReactElement = (
  j: JSCodeshift,
  maybeJsx: ReturnStatement["argument"],
) =>
  j.BooleanLiteral.check(maybeJsx) ||
  j.StringLiteral.check(maybeJsx) ||
  j.NullLiteral.check(maybeJsx) ||
  j.NumericLiteral.check(maybeJsx) ||
  j.JSXElement.check(maybeJsx) ||
  j.JSXFragment.check(maybeJsx);

const getComponentStaticPropValue = (
  j: JSCodeshift,
  root: Collection<any>,
  componentName: string,
  name: string,
): ASTPath<MemberExpression> | null => {
  return (
    root
      .find(j.MemberExpression, {
        object: {
          type: "Identifier",
          name: componentName,
        },
        property: {
          type: "Identifier",
          name,
        },
      })
      .paths()
      .at(0) ?? null
  );
};

const buildPropertyWithDefaultValue = (
  j: JSCodeshift,
  property: ObjectProperty,
  defaultValue: any,
) => {
  return j.assignmentPattern(property.value, defaultValue);
};

type FunctionLike =
  | FunctionDeclaration
  | FunctionExpression
  | ArrowFunctionExpression;

const getFunctionComponents = (j: JSCodeshift, root: Collection) => {
  const functionLikePaths: ASTPath<FunctionLike>[] = [
    ...root.find(j.FunctionDeclaration).paths(),
    ...root.find(j.FunctionExpression).paths(),
    ...root.find(j.ArrowFunctionExpression).paths(),
  ];

  return functionLikePaths.filter((path) =>
    j(path)
      .find(j.ReturnStatement)
      .every((path) => isReactElement(j, path.value.argument)),
  );
};

const getFunctionComponentName = (
  j: JSCodeshift,
  path: ASTPath<FunctionLike>,
): string | null =>
  j.ArrowFunctionExpression.check(path.value) &&
  j.VariableDeclarator.check(path.parent.value) &&
  j.Identifier.check(path.parent.value.id)
    ? path.parent.value.id.name
    : path.value.id?.name ?? null;

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  getFunctionComponents(j, root).forEach((path) => {
    const componentName = getFunctionComponentName(j, path);

    if (componentName === null) {
      return;
    }

    const defaultProps = getComponentStaticPropValue(
      j,
      root,
      componentName,
      "defaultProps",
    );

    const defaultPropsRight = defaultProps?.parent?.value?.right ?? null;

    if (!defaultProps || !j.ObjectExpression.check(defaultPropsRight)) {
      return;
    }

    const defaultPropsMap = new Map();

    defaultPropsRight.properties?.forEach((property) => {
      if (
        !j.ObjectProperty.check(property) ||
        !j.Identifier.check(property.key)
      ) {
        return;
      }

      defaultPropsMap.set(property.key.name, property.value);
    });

    const propsArg = path.value.params.at(0);

    if (j.ObjectPattern.check(propsArg)) {
      propsArg.properties.forEach((property) => {
        if (
          !j.ObjectProperty.check(property) ||
          !j.Identifier.check(property.key) ||
          j.AssignmentPattern.check(property.value)
        ) {
          return;
        }

        isDirty = true;
        property.value = buildPropertyWithDefaultValue(
          j,
          property,
          defaultPropsMap.get(property.key.name),
        );
      });
    }

    j(defaultProps).closest(j.ExpressionStatement).remove();
    isDirty = true;
  });

  return isDirty ? root.toSource() : undefined;
}
