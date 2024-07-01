import type {
  ASTPath,
  ClassDeclaration,
  Collection,
  JSCodeshift,
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
      REACT_CLASS_COMPONENT_SUPERCLASS_NAMES.includes(superClass.property.name)
    ) {
      return true;
    }

    return false;
  });
};

export const getClassMethod = (
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

export const getClassProperty = (
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

export const findPatterns = (j: JSCodeshift, root: Collection) =>
  getClassComponents(j, root)
    .paths()
    .map((path) => {
      const childContextTypes = getClassProperty(j, path, "childContextTypes");
      const getChildContext = getClassMethod(j, path, "getChildContext");

      if (!childContextTypes || !getChildContext) {
        return;
      }

      return {
        classComponent: path,
        childContextTypes,
        getChildContext,
      };
    })
    .filter(Boolean);
