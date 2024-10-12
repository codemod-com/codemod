export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the export const meta function
  root.find(j.ExportNamedDeclaration).forEach(path => {
    const declaration = path.node.declaration;
    if (j.VariableDeclaration.check(declaration)) {
      const declarator = declaration.declarations[0];
      if (j.VariableDeclarator.check(declarator) && j.Identifier.check(declarator.id) && declarator.id.name === 'meta') {
        const init = declarator.init;
        if (j.FunctionExpression.check(init) || j.ArrowFunctionExpression.check(init)) {
          const params = init.params;
          if (params.length === 1 && j.ObjectPattern.check(params[0])) {
            // Add matches to the function parameters
            params[0].properties.push(j.property.from({
              kind: 'init',
              key: j.identifier('matches'),
              value: j.identifier('matches'),
              shorthand: true
            }));
            dirtyFlag = true;
          }

          // Change the return type to an array containing a single object
          root.find(j.BlockStatement).forEach(blockPath => {
            const body = blockPath.node.body;
            body.forEach((statement, index) => {
              if (j.ReturnStatement.check(statement) && j.ObjectExpression.check(statement.argument)) {
                body[index] = j.returnStatement(
                  j.arrayExpression([statement.argument])
                );
                dirtyFlag = true;
              }
            });
          });
        }
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}