export default function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find the invalid usage of socket.to(...).broadcast.emit(...)
  root.find(j.CallExpression, {
      callee: {
          object: {
              object: {
                  callee: {
                      object: { name: 'socket' },
                      property: { name: 'to' },
                  },
              },
              property: { name: 'broadcast' },
          },
          property: { name: 'emit' },
      },
  }).forEach((path) => {
      const toCall = path.node.callee.object.object; // socket.to("room1")
      const roomArg = toCall.arguments[0]; // Argument passed to .to("room1")
      const emitArgs = path.node.arguments; // Arguments passed to .emit(...)

      // Create the new expression: socket.to("room1").emit(...)
      const newCallExpression = j.callExpression(
          j.memberExpression(
              j.callExpression(
                  j.memberExpression(
                      j.identifier('socket'),
                      j.identifier('to'),
                  ),
                  [roomArg],
              ),
              j.identifier('emit'),
          ),
          emitArgs,
      );

      // Replace the original invalid expression with the new one and comments
      j(path).replaceWith(newCallExpression);
  });

  return root.toSource();
}