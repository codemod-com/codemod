// BUILT WITH https://codemod.studio

import type {
  API,
  ASTPath,
  ClassDeclaration,
  Collection,
  Expression,
  FileInfo,
  JSCodeshift,
  Options,
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

const getClassMethod = (
  j: JSCodeshift,
  klass: ASTPath<ClassDeclaration>,
  name: string,
) =>
  j(klass)
    .find(j.ClassMethod, {
      key: {
        type: "Identifier",
        name,
      },
    })
    .paths()
    .at(0) ?? null;

const getClassProperty = (
  j: JSCodeshift,
  klass: ASTPath<ClassDeclaration>,
  name: string,
) =>
  j(klass)
    .find(j.ClassProperty, {
      key: {
        type: "Identifier",
        name,
      },
    })
    .paths()
    .at(0) ?? null;

//  const FooContext = React.createContext();
const buildContextVariableDeclaration = (j: JSCodeshift) =>
  j.variableDeclaration("const", [
    j.variableDeclarator(
      j.identifier("Context"),
      j.callExpression(
        j.memberExpression(
          j.identifier("React"),
          j.identifier("createContext"),
        ),
        [],
      ),
    ),
  ]);

const buildContextProvider = (j: JSCodeshift, value: any, renderedJsx: any) =>
  j.jsxElement(
    j.jsxOpeningElement(j.jsxIdentifier("Context"), [
      j.jsxAttribute(j.jsxIdentifier("value"), j.jsxExpressionContainer(value)),
    ]),
    j.jsxClosingElement(j.jsxIdentifier("Context")),
    [renderedJsx],
  );

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  getClassComponents(j, root).forEach((path) => {
    const childContextTypes = getClassProperty(j, path, "childContextTypes");
    const getChildContext = getClassMethod(j, path, "childContextTypes");

    if (childContextTypes === null || getChildContext === null) {
      return;
    }

    const childContextValue =
      j(getChildContext).find(j.ReturnStatement).paths().at(0)?.value
        .argument ?? null;

    j(childContextTypes).remove();

    // add Context variable declaration
    const variableDeclaration = buildContextVariableDeclaration(j);
    path.insertBefore(variableDeclaration);

    const render = getClassMethod(j, path, "render");

    const renderReturnStatement = render
      ? j(render).find(j.ReturnStatement).paths().at(0)
      : null;

    const renderedJsx = renderReturnStatement?.value.argument;

    if (!renderedJsx) {
      return;
    }

    renderReturnStatement.value.argument = buildContextProvider(
      j,
      childContextValue,
      renderedJsx,
    );
  });

  return root.toSource();
}
