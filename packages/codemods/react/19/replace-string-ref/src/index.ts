import type { API, FileInfo, JSCodeshift, Options } from "jscodeshift";

const REACT_CLASS_COMPONENT_SUPERCLASS = ["PureComponent", "Component"];

const buildCallbackRef = (j: JSCodeshift, refName: string) =>
  j.jsxAttribute(
    j.jsxIdentifier("ref"),
    j.jsxExpressionContainer(
      j.arrowFunctionExpression(
        [j.jsxIdentifier("ref")],
        j.blockStatement([
          j.expressionStatement(
            j.assignmentExpression(
              "=",
              j.memberExpression(
                j.memberExpression(j.thisExpression(), j.identifier("refs")),
                j.identifier(refName),
              ),
              j.identifier("ref"),
            ),
          ),
        ]),
      ),
    ),
  );

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  let isDirty = false;

  const classComponentsCollection = root
    .find(j.ClassDeclaration)
    .filter((path) => {
      const sup = path.value.superClass;

      if (j.Identifier.check(sup)) {
        return REACT_CLASS_COMPONENT_SUPERCLASS.includes(sup.name);
      }

      if (j.MemberExpression.check(sup) && j.Identifier.check(sup.property)) {
        return REACT_CLASS_COMPONENT_SUPERCLASS.includes(sup.property.name);
      }

      return false;
    });

  classComponentsCollection
    .find(j.JSXElement, {
      openingElement: {
        attributes: [
          {
            type: "JSXAttribute",
            name: {
              type: "JSXIdentifier",
              name: "ref",
            },
          },
        ],
      },
    })
    .forEach((path) => {
      path.value.openingElement.attributes =
        path.value.openingElement.attributes?.map((attribute) => {
          if (
            j.JSXAttribute.check(attribute) &&
            attribute.name.name === "ref" &&
            j.StringLiteral.check(attribute.value)
          ) {
            isDirty = true;

            return buildCallbackRef(j, attribute.value.value);
          }

          return attribute;
        });
    });

  return isDirty ? root.toSource() : undefined;
}
