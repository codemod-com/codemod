export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the startServer function
  root.find(j.FunctionDeclaration, { id: { name: 'startServer' } }).forEach(path => {
    const body = path.node.body.body;

    // Check if module.enableCompileCache() is already present
    const hasEnableCompileCache = body.some(statement =>
      j.ExpressionStatement.check(statement) &&
      j.CallExpression.check(statement.expression) &&
      j.MemberExpression.check(statement.expression.callee) &&
      j.Identifier.check(statement.expression.callee.object) &&
      statement.expression.callee.object.name === 'module' &&
      j.Identifier.check(statement.expression.callee.property) &&
      statement.expression.callee.property.name === 'enableCompileCache'
    );

    if (!hasEnableCompileCache) {
      // Insert const result = module.enableCompileCache() at the beginning of the function body
      const enableCompileCacheCall = j.variableDeclaration('const', [
        j.variableDeclarator(
          j.identifier('result'),
          j.callExpression(
            j.memberExpression(
              j.identifier('module'),
              j.identifier('enableCompileCache')
            ),
            []
          )
        )
      ]);
      body.unshift(enableCompileCacheCall);
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}