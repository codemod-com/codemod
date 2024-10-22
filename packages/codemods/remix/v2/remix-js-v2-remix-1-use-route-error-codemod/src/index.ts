export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Remove CatchBoundary function
  root.find(j.FunctionDeclaration, { id: { name: 'CatchBoundary' } }).remove();

  // Modify ErrorBoundary function
  root.find(j.FunctionDeclaration, { id: { name: 'ErrorBoundary' } }).forEach(path => {
    // Replace error prop with useRouteError
    j(path).find(j.Identifier, { name: 'error' }).replaceWith(j.identifier('useRouteError'));

    // Remove console.error statement
    j(path).find(j.ExpressionStatement, {
      expression: {
        callee: { object: { name: 'console' }, property: { name: 'error' } }
      }
    }).remove();

    // Add isRouteErrorResponse check
    const body = path.node.body.body;
    const errorCheck = j.ifStatement(
      j.callExpression(j.identifier('isRouteErrorResponse'), [j.identifier('error')]),
      j.blockStatement([
        j.returnStatement(
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier('div'), []),
            j.jsxClosingElement(j.jsxIdentifier('div')),
            [
              j.jsxElement(
                j.jsxOpeningElement(j.jsxIdentifier('h1'), []),
                j.jsxClosingElement(j.jsxIdentifier('h1')),
                [j.jsxText('Oops')]
              ),
              j.jsxElement(
                j.jsxOpeningElement(j.jsxIdentifier('p'), []),
                j.jsxClosingElement(j.jsxIdentifier('p')),
                [j.jsxText('Status: '), j.jsxExpressionContainer(j.memberExpression(j.identifier('error'), j.identifier('status')))]
              ),
              j.jsxElement(
                j.jsxOpeningElement(j.jsxIdentifier('p'), []),
                j.jsxClosingElement(j.jsxIdentifier('p')),
                [j.jsxExpressionContainer(j.memberExpression(j.memberExpression(j.identifier('error'), j.identifier('data')), j.identifier('message')))]
              )
            ]
          )
        )
      ])
    );

    // Add default error message handling
    const errorMessageHandling = [
      j.variableDeclaration('let', [
        j.variableDeclarator(j.identifier('errorMessage'), j.literal('Unknown error'))
      ]),
      j.ifStatement(
        j.callExpression(j.identifier('isDefinitelyAnError'), [j.identifier('error')]),
        j.blockStatement([
          j.expressionStatement(
            j.assignmentExpression('=', j.identifier('errorMessage'), j.memberExpression(j.identifier('error'), j.identifier('message')))
          )
        ])
      )
    ];

    // Add final return statement
    const finalReturn = j.returnStatement(
      j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('div'), []),
        j.jsxClosingElement(j.jsxIdentifier('div')),
        [
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier('h1'), []),
            j.jsxClosingElement(j.jsxIdentifier('h1')),
            [j.jsxText('Uh oh ...')]
          ),
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier('p'), []),
            j.jsxClosingElement(j.jsxIdentifier('p')),
            [j.jsxText('Something went wrong.')]
          ),
          j.jsxElement(
            j.jsxOpeningElement(j.jsxIdentifier('pre'), []),
            j.jsxClosingElement(j.jsxIdentifier('pre')),
            [j.jsxExpressionContainer(j.identifier('errorMessage'))]
          )
        ]
      )
    );

    // Replace function body
    path.node.body.body = [j.variableDeclaration('const', [
      j.variableDeclarator(j.identifier('error'), j.callExpression(j.identifier('useRouteError'), []))
    ]), errorCheck, ...errorMessageHandling, finalReturn];
    dirtyFlag = true;
  });

  // Update imports
  if (dirtyFlag) {
    root.find(j.ImportDeclaration, { source: { value: '@remix-run/react' } }).forEach(path => {
      const specifiers = path.node.specifiers.filter(specifier => specifier.imported.name !== 'useCatch');
      specifiers.push(j.importSpecifier(j.identifier('useRouteError')));
      specifiers.push(j.importSpecifier(j.identifier('isRouteErrorResponse')));
      path.node.specifiers = specifiers;
    });
  }

  return dirtyFlag ? root.toSource() : undefined;
}