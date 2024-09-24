export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all expressions that are member expressions of WebAppInternals
  root.find(j.ExpressionStatement).forEach(path => {
    const expr = path.node.expression;
    if (j.CallExpression.check(expr) && j.MemberExpression.check(expr.callee) && expr.callee.object.name === 'WebAppInternals') {
      // Prefix the expression with 'await'
      path.replace(
        j.expressionStatement(
          j.awaitExpression(expr)
        )
      );
      dirtyFlag = true;
    }
  });

  // Find all member expressions of WebAppInternals that are not call expressions
  root.find(j.MemberExpression, {
    object: { name: 'WebAppInternals' }
  }).forEach(path => {
    const parent = path.parentPath;
    if (j.ExpressionStatement.check(parent.node)) {
      // Prefix the expression with 'await'
      parent.replace(
        j.expressionStatement(
          j.awaitExpression(path.node)
        )
      );
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}