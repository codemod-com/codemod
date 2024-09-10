export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find the variable declaration with the specific property access
  root.find(j.VariableDeclarator, {
    init: {
      type: 'MemberExpression',
      object: { name: 'systemPreferences' },
      property: { name: 'accessibilityDisplayShouldReduceTransparency' }
    }
  }).forEach(path => {
    // Replace the property access with the new one
    path.get('init').replace(
      j.memberExpression(
        j.identifier('nativeTheme'),
        j.identifier('prefersReducedTransparency')
      )
    );
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}