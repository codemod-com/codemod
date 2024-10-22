export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace import { KeysWithSeparator } with { JoinKeys }
  root.find(j.ImportDeclaration, { source: { value: 'i18next' } })
    .find(j.ImportSpecifier, { imported: { name: 'KeysWithSeparator' } })
    .forEach(path => {
      path.replace(j.importSpecifier(j.identifier('JoinKeys')));
      dirtyFlag = true;
    });

  // Replace type KeysWithSeparator<string> with JoinKeys<string>
  root.find(j.TSTypeReference, { typeName: { type: 'Identifier', name: 'KeysWithSeparator' } })
    .forEach(path => {
      path.replace(j.tsTypeReference(j.identifier('JoinKeys'), path.node.typeParameters));
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}