export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace parseTransaction(txBytes) with Transaction.from(txBytes)
  root.find(j.CallExpression, { callee: { name: 'parseTransaction' } })
    .forEach(path => {
      if (path.node.arguments.length === 1) {
        path.replace(
          j.callExpression(
            j.memberExpression(j.identifier('Transaction'), j.identifier('from')),
            path.node.arguments
          )
        );
        dirtyFlag = true;
      }
    });

  // Replace serializeTransaction(tx) and serializeTransaction(tx, sig) with Transaction.from(tx).serialized
  root.find(j.CallExpression, { callee: { name: 'serializeTransaction' } })
    .forEach(path => {
      if (path.node.arguments.length >= 1) {
        path.replace(
          j.memberExpression(
            j.callExpression(
              j.memberExpression(j.identifier('Transaction'), j.identifier('from')),
              [path.node.arguments[0]]
            ),
            j.identifier('serialized')
          )
        );
        dirtyFlag = true;
      }
    });

  // Remove any import statements for 'Transaction' from 'anotherlib'
  if (dirtyFlag) {
    root.find(j.ImportDeclaration, { source: { value: 'anotherlib' } })
      .forEach(path => {
        path.node.specifiers = path.node.specifiers.filter(specifier => {
          return !(j.ImportSpecifier.check(specifier) && specifier.imported.name === 'Transaction');
        });
        if (path.node.specifiers.length === 0) {
          j(path).remove();
        }
      });
  }

  return dirtyFlag ? root.toSource() : undefined;
}