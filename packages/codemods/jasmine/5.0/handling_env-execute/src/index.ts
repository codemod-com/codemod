import { API, FileInfo } from 'jscodeshift';

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all CallExpressions where env.execute is called with a callback
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'env' },
      property: { name: 'execute' }
    },
    arguments: (args: any[]) => args.length === 2 && j.FunctionExpression.check(args[1]),
  }).forEach((path) => {
    const callExpression = path.node;

    // Replace the function expression argument with async/await syntax
    callExpression.arguments = [];

    // Wrap in an await expression
    const awaitExpression = j.awaitExpression(callExpression);

    // Replace the old statement with await env.execute()
    j(path).replaceWith(awaitExpression);
  });

  return root.toSource();
}
