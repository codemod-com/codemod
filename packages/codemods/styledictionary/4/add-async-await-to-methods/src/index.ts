export default function transformer(fileInfo, api) {
  const j = api.jscodeshift;

  // Methods that should be awaited
  const asyncMethods = [
    "cleanAllPlatforms",
    "buildAllPlatforms",
    "extend",
    "exportPlatform",
    "getPlatform",
    "buildPlatform",
    "cleanPlatform",
  ];

  const root = j(fileInfo.source);

  // Find all function declarations, function expressions, and arrow functions
  root.find(j.FunctionDeclaration).forEach((path) => addAsyncIfNeeded(path, j));

  root.find(j.FunctionExpression).forEach((path) => addAsyncIfNeeded(path, j));

  root
    .find(j.ArrowFunctionExpression)
    .forEach((path) => addAsyncIfNeeded(path, j));

  // Add 'await' before the relevant method calls
  asyncMethods.forEach((method) => {
    root
      .find(j.CallExpression, {
        callee: { property: { name: method } },
      })
      .forEach((path) => {
        // Check if the method is already awaited
        if (!j.AwaitExpression.check(path.parent.node)) {
          j(path).replaceWith(j.awaitExpression(path.node));
        }
      });
  });

  return root.toSource();

  // Helper function to add 'async' if needed
  function addAsyncIfNeeded(path, j) {
    // Check if the function body contains any of the async methods
    const containsAsyncMethod = j(path)
      .find(j.CallExpression)
      .some((callPath) =>
        asyncMethods.includes(callPath.node.callee.property?.name),
      );

    // Only mark as async if it contains one of the async methods
    if (containsAsyncMethod && !path.node.async) {
      path.node.async = true;
    }
  }
}
