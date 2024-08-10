import type {
  API,
  FileInfo,
  JSCodeshift,
  Options,
  Transform,
} from "jscodeshift";

const buildParamsVariableDeclaration = (j: JSCodeshift) =>
  j.variableDeclaration("const", [
    j.variableDeclarator(
      j.objectPattern([
        j.objectProperty.from({
          shorthand: true,
          key: j.identifier("params"),
          value: j.identifier("params"),
        }),
      ]),
      j.identifier("match"),
    ),
  ]);

function transform(
  file: FileInfo,
  api: API,
  options: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.ArrowFunctionExpression).forEach((path) => {
    const name = path.parent.value.id.name;
    const usesRedux = ["mapStateToProps", "mapDispatchToProps"].includes(name);

    const [arg1, arg2] = path.node.params;

    const targetArg = usesRedux ? arg2 : arg1;

    if (j.ObjectPattern.check(targetArg)) {
      const firstProperty = targetArg.properties[0];

      if (
        j.ObjectProperty.check(firstProperty) &&
        j.Identifier.check(firstProperty.key) &&
        firstProperty.key.name === "params"
      ) {
        firstProperty.key.name = "match";
      }

      const newDeclaration = buildParamsVariableDeclaration(j);

      const body = path.value.body;

      if (j.BlockStatement.check(body)) {
        body.body.unshift(newDeclaration);
      }
    }

    if (j.Identifier.check(targetArg)) {
      j(path)
        .find(j.MemberExpression)
        .forEach((memberPath) => {
          const memberObject = memberPath.node.object;

          if (
            j.Identifier.check(memberObject) &&
            memberObject.name === "params"
          ) {
            memberPath.node.object = j.memberExpression(
              j.identifier("match"),
              j.identifier("params"),
            );
          }
        });
    }
  });

  return root.toSource(options);
}

transform satisfies Transform;

export default transform;
