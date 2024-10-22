export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the setup function call and add 'root' to the destructured object
  root.find(j.VariableDeclarator, {
    id: {
      type: 'ObjectPattern',
      properties: (props) => props.some(prop => prop.key.name === 'setup')
    }
  }).forEach(path => {
    const properties = path.node.id.properties;
    if (!properties.some(prop => prop.key.name === 'root')) {
      properties.unshift(j.property.from({
        kind: 'init',
        key: j.identifier('root'),
        value: j.identifier('root'),
        shorthand: true
      }));
      dirtyFlag = true;
    }
  });

  // Find the body of the test function and add the new assertions
  root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'it'
    }
  }).forEach(path => {
    const body = path.node.arguments[1].body.body;
    const setupIndex = body.findIndex(statement =>
      j.VariableDeclaration.check(statement) &&
      statement.declarations.some(decl =>
        j.ObjectPattern.check(decl.id) &&
        decl.id.properties.some(prop => prop.key.name === 'setup')
      )
    );

    if (setupIndex !== -1) {
      const newAssertions = [
        j.expressionStatement(
          j.callExpression(
            j.memberExpression(
              j.callExpression(
                j.identifier('expect'),
                [j.callExpression(
                  j.memberExpression(j.identifier('root'), j.identifier('getAttribute')),
                  [j.literal('data-disabled')]
                )]
              ),
              j.identifier('toBe')
            ),
            [j.literal('')]
          )
        ),
        j.expressionStatement(
          j.callExpression(
            j.memberExpression(
              j.callExpression(
                j.identifier('expect'),
                [j.callExpression(
                  j.memberExpression(j.identifier('input'), j.identifier('getAttribute')),
                  [j.literal('data-disabled')]
                )]
              ),
              j.identifier('toBe')
            ),
            [j.literal('')]
          )
        )
      ];

      // Insert the new assertions after the setup call
      body.splice(setupIndex + 1, 0, ...newAssertions);
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}