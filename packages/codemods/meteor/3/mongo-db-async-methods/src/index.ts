export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // List of methods to transform
  const methods = ["find", "findOne", "insert", "upsert", "update", "remove"];

  // Find all call expressions
  root.find(j.CallExpression).forEach((path) => {
    const { node } = path;

    // Check if the callee is a member expression and ends with .fetch()
    if (
      j.MemberExpression.check(node.callee) &&
      j.Identifier.check(node.callee.property) &&
      node.callee.property.name === "fetch"
    ) {
      const innerCall = node.callee.object;

      // Check if the inner call is a call expression and the method is in our list
      if (
        j.CallExpression.check(innerCall) &&
        j.MemberExpression.check(innerCall.callee) &&
        j.Identifier.check(innerCall.callee.property) &&
        methods.includes(innerCall.callee.property.name)
      ) {
        const methodName = innerCall.callee.property.name;
        const asyncMethodName = `${methodName}Async`;

        // Replace the method name with the async version
        innerCall.callee.property.name = asyncMethodName;

        // Replace the original call with the awaited async call
        path.replace(j.awaitExpression(innerCall));
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}
