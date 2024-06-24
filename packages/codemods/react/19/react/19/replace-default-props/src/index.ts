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
  ObjectProperty,
  Options,
  ReturnStatement,
} from "jscodeshift";

/**
 * Utils
 *
 */

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

const getCallExpressionsByImport = (
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

const getClassComponents = (j: JSCodeshift, root: Collection<any>) => {
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
  j.JsxElement.check(maybeJsx) ||
  j.JsxFragment.check(maybeJsx);

const getComponentStaticPropValue = (
  j: JSCodeshift,
  componentName: string,
  name: string,
) => {
  let value = null;

  j.find(j.MemberExpression).forEach((path) => {
    if (
      j.Identifier.check(path.value.object) &&
      path.value.object.name === componentName &&
      j.Identifier.check(path.value.callee.property) &&
      path.value.callee.property.name === name
    ) {
      const parent = path.value.parent;
      if (!j.AssignmentExpression.check(parent)) {
        return;
      }

      value = parent.right;
    }
  });

  return value;
};

const buildPropertyWithDefaultValue = (
  property: ObjectProperty,
  defaultValue: any,
) => {
  return property;
};

const getFunctionComponents = (j: JSCodeshift, root: Collection) => {
  const functionLikePaths: ASTPath<
    FunctionDeclaration | FunctionExpression | ArrowFunctionExpression
  >[] = [
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

const getReactComponents = (j: JSCodeshift, root: Collection) => {
  getFunctionComponents(j, root).forEach((path) => {
    const defaultProps = getComponentStaticPropValue(
      j,
      path.value.id?.name ?? "",
      "defaultProps",
    );

    if (!j.ObjectExpression.check(defaultProps)) {
      return;
    }

    const defaultPropsMap = new Map();

    defaultProps.properties?.forEach((prop) => {
      defaultPropsMap.set(prop.key.name, prop.key.value);
    });

    const propsArg = path.value.params.at(0);

    if (j.ObjectPattern.check(propsArg)) {
      propsArg.properties.forEach((property) => {
        if (j.AssignmentPattern.check(property.value)) {
          return;
        }

        property.value = buildPropertyWithDefaultValue(
          property.value,
          defaultPropsMap.get(property.key.name),
        );
      });
    }
  });
};

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Find all variable declarations
  root.find(j.VariableDeclarator).forEach((path) => {
    // Ensure the node is an Identifier and its name is 'toReplace'
    if (
      path.node.id.type === "Identifier" &&
      path.node.id.name === "toReplace"
    ) {
      // Create a new Identifier with the name 'replacement'
      const newId = j.identifier("replacement");

      // Replace the old Identifier with the new one, preserving comments
    }
  });

  return root.toSource();
}
