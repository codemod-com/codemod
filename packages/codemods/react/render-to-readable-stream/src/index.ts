export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all call expressions to renderToReadableStream
  root.find(j.CallExpression, {
    callee: {
      type: 'Identifier',
      name: 'renderToReadableStream',
    },
  }).forEach((path) => {
    const args = path.value.arguments;

    // Ensure there are exactly three arguments
    if (args.length === 3) {
      const [widget, onErrorCallback, appContextData] = args;

      // Check if the second and third arguments are identifiers
      if (
        j.Identifier.check(onErrorCallback) &&
        j.Identifier.check(appContextData)
      ) {
        // Create the new object argument
        const newObjectArg = j.objectExpression([
          j.property.from({
            kind: 'init',
            key: j.identifier('onError'),
            value: onErrorCallback,
            shorthand: false,
          }),
          j.property.from({
            kind: 'init',
            key: j.identifier('context'),
            value: appContextData,
            shorthand: false,
          }),
          j.property.from({
            kind: 'init',
            key: j.identifier('identifierPrefix'),
            value: j.identifier('prefix'),
            shorthand: true,
          }),
        ]);

        // Replace the arguments in the call expression
        path.value.arguments = [widget, newObjectArg];
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}