export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace import { watchEffect } with { watchPostEffect }
  root.find(j.ImportDeclaration, { source: { value: 'vue' } })
    .find(j.ImportSpecifier, { imported: { name: 'watchEffect' } })
    .forEach(path => {
      path.replace(j.importSpecifier(j.identifier('watchPostEffect')));
      dirtyFlag = true;
    });

  // Replace watchEffect() calls with watchPostEffect()
  root.find(j.CallExpression, { callee: { name: 'watchEffect' } })
    .forEach(path => {
      path.get('callee').replace(j.identifier('watchPostEffect'));
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}