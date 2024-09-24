export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Transform BigNumber.from('1000') to BigInt('1000')
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "BigNumber" },
        property: { name: "from" },
      },
    })
    .forEach((path) => {
      if (j.Literal.check(path.node.arguments[0])) {
        path.replace(
          j.callExpression(j.identifier("BigInt"), [path.node.arguments[0]]),
        );
        dirtyFlag = true;
      }
    });

  // Transform value1.add(value2) to value1 + value2
  root
    .find(j.CallExpression, {
      callee: {
        property: { name: "add" },
      },
    })
    .forEach((path) => {
      const { object } = path.node.callee;
      const args = path.node.arguments;
      if (args && args.length === 1) {
        path.replace(j.binaryExpression("+", object, args[0]));
        dirtyFlag = true;
      }
    });

  // Transform value1.eq(value2) to value1 == value2
  root
    .find(j.CallExpression, {
      callee: {
        property: { name: "eq" },
      },
    })
    .forEach((path) => {
      const { object } = path.node.callee;
      const args = path.node.arguments;
      if (args && args.length === 1) {
        path.replace(j.binaryExpression("==", object, args[0]));
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}
