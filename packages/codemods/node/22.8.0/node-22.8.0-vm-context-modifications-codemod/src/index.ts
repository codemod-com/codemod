export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace vm.createContext() with vm.createContext(vm.constants.DONT_CONTEXTIFY)
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'vm' },
      property: { name: 'createContext' }
    }
  }).forEach(path => {
    if (path.node.arguments.length === 0) {
      path.node.arguments.push(
        j.memberExpression(
          j.memberExpression(j.identifier('vm'), j.identifier('constants')),
          j.identifier('DONT_CONTEXTIFY')
        )
      );
      dirtyFlag = true;
    }
  });

  // Remove the try-catch block around Object.freeze(globalThis);
  root.find(j.TryStatement).forEach(path => {
    const blockStatements = path.node.block.body;
    if (blockStatements.length === 1 && j.ExpressionStatement.check(blockStatements[0])) {
      const expr = blockStatements[0].expression;
      if (j.CallExpression.check(expr) &&
        j.MemberExpression.check(expr.callee) &&
        expr.callee.object.name === 'vm' &&
        expr.callee.property.name === 'runInContext' &&
        expr.arguments.length === 2 &&
        j.Literal.check(expr.arguments[0]) &&
        expr.arguments[0].value === 'Object.freeze(globalThis);'
      ) {
        j(path).replaceWith(blockStatements[0]);
        dirtyFlag = true;
      }
    }
  });

  // Replace the code inside the try-catch block that accesses and modifies globalThis.foo
  root.find(j.TryStatement).forEach(path => {
    const blockStatements = path.node.block.body;
    if (blockStatements.length === 1 && j.ExpressionStatement.check(blockStatements[0])) {
      const expr = blockStatements[0].expression;
      if (j.CallExpression.check(expr) &&
        j.MemberExpression.check(expr.callee) &&
        expr.callee.object.name === 'vm' &&
        expr.callee.property.name === 'runInContext' &&
        expr.arguments.length === 2 &&
        j.Literal.check(expr.arguments[0]) &&
        expr.arguments[0].value.includes('globalThis.foo')
      ) {
        expr.arguments[0].value = 'bar = 1; bar;';
        dirtyFlag = true;
      }
    }
  });

  // Remove the console.log statement that accesses globalThis.foo
  root.find(j.ExpressionStatement, {
    expression: {
      type: 'CallExpression',
      callee: {
        type: 'MemberExpression',
        object: { name: 'console' },
        property: { name: 'log' }
      },
      arguments: [{
        type: 'CallExpression',
        callee: {
          type: 'MemberExpression',
          object: { name: 'vm' },
          property: { name: 'runInContext' }
        },
        arguments: [{
          type: 'Literal',
          value: 'globalThis.foo = 1; foo;'
        }]
      }]
    }
  }).remove();

  // Add the new try-catch block with vm.runInContext('bar = 1; bar;', context)
  root.find(j.Program).forEach(path => {
    const body = path.node.body;
    const lastIndex = body.length - 1;
    const lastStatement = body[lastIndex];

    if (j.ExpressionStatement.check(lastStatement) &&
      j.CallExpression.check(lastStatement.expression) &&
      j.MemberExpression.check(lastStatement.expression.callee) &&
      lastStatement.expression.callee.object.name === 'console' &&
      lastStatement.expression.callee.property.name === 'log' &&
      lastStatement.expression.arguments.length === 1 &&
      j.CallExpression.check(lastStatement.expression.arguments[0]) &&
      j.MemberExpression.check(lastStatement.expression.arguments[0].callee) &&
      lastStatement.expression.arguments[0].callee.object.name === 'vm' &&
      lastStatement.expression.arguments[0].callee.property.name === 'runInContext' &&
      lastStatement.expression.arguments[0].arguments.length === 2 &&
      j.Literal.check(lastStatement.expression.arguments[0].arguments[0]) &&
      lastStatement.expression.arguments[0].arguments[0].value === 'globalThis.foo = 1; foo;'
    ) {
      const tryCatchBlock = j.tryStatement(
        j.blockStatement([
          j.expressionStatement(
            j.callExpression(
              j.memberExpression(j.identifier('vm'), j.identifier('runInContext')),
              [j.literal('bar = 1; bar;'), j.identifier('context')]
            )
          )
        ]),
        j.catchClause(
          j.identifier('e'),
          null,
          j.blockStatement([
            j.expressionStatement(
              j.callExpression(
                j.memberExpression(j.identifier('console'), j.identifier('log')),
                [j.identifier('e')]
              )
            )
          ])
        )
      );

      body[lastIndex] = tryCatchBlock;
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}