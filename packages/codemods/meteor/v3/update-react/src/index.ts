export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace useSubscribe call to remove assignment and call it directly
  root.find(j.VariableDeclarator, {
    id: { type: 'Identifier' },
    init: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'useSubscribe' }
    }
  }).forEach(path => {
    const expressionStatement = j.expressionStatement(path.node.init);
    j(path.parent).replaceWith(expressionStatement);
    dirtyFlag = true;
  });

  // Modify useTracker calls
  root.find(j.CallExpression, {
    callee: { type: 'Identifier', name: 'useTracker' }
  }).forEach(path => {
    const callback = path.node.arguments[0];
    if (j.FunctionExpression.check(callback) || j.ArrowFunctionExpression.check(callback)) {
      const body = callback.body;
      if (j.BlockStatement.check(body)) {
        const returnStatement = body.body.find(stmt => j.ReturnStatement.check(stmt));
        if (returnStatement) {
          const returnValue = returnStatement.argument;
          if (j.CallExpression.check(returnValue)) {
            const callee = returnValue.callee;
            if (j.MemberExpression.check(callee) && j.Identifier.check(callee.object) && callee.object.name === 'Meteor' && j.Identifier.check(callee.property)) {
              if (callee.property.name === 'user') {
                // Replace Meteor.user() with Meteor.userAsync()
                callee.property.name = 'userAsync';
                path.node.arguments.unshift(j.literal('user'));
                dirtyFlag = true;
              }
            } else if (j.CallExpression.check(returnValue) && j.MemberExpression.check(returnValue.callee) && j.Identifier.check(returnValue.callee.property) && returnValue.callee.property.name === 'fetch') {
              // Replace fetch() with fetchAsync()
              returnValue.callee.property.name = 'fetchAsync';
              path.node.arguments.unshift(j.literal('tasksByUser'));
              dirtyFlag = true;
            }
          }
        }
      } else if (j.CallExpression.check(body)) {
        const callee = body.callee;
        if (j.MemberExpression.check(callee) && j.Identifier.check(callee.object) && callee.object.name === 'Meteor' && j.Identifier.check(callee.property)) {
          if (callee.property.name === 'user') {
            // Replace Meteor.user() with Meteor.userAsync()
            callee.property.name = 'userAsync';
            path.node.arguments.unshift(j.literal('user'));
            dirtyFlag = true;
          }
        } else if (j.CallExpression.check(body) && j.MemberExpression.check(body.callee) && j.Identifier.check(body.callee.property) && body.callee.property.name === 'fetch') {
          // Replace fetch() with fetchAsync()
          body.callee.property.name = 'fetchAsync';
          path.node.arguments.unshift(j.literal('tasksByUser'));
          dirtyFlag = true;
        }
      }
    }
  });

  // Remove the if (isLoading()) { return <Loading />; } block
  root.find(j.IfStatement, {
    test: {
      type: 'CallExpression',
      callee: { type: 'Identifier', name: 'isLoading' }
    }
  }).forEach(path => {
    j(path).remove();
    dirtyFlag = true;
  });

  // Update import statement
  root.find(j.ImportDeclaration, {
    source: { value: 'meteor/react-meteor-data' }
  }).forEach(path => {
    path.node.source.value = 'meteor/react-meteor-data/suspense';
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}