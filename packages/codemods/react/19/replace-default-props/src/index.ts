import type {
  API,
  ASTPath,
  Collection,
  FileInfo,
  JSCodeshift,
  MemberExpression,
  ObjectProperty,
} from "jscodeshift";

import {
  getFunctionComponents,
  getFunctionName,
} from "@codemod.com/codemod-utils";

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

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  getFunctionComponents(j, root).forEach((path) => {
    const componentName = getFunctionName(j, path);

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
