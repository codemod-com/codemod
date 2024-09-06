export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Step 1: Change the type annotation from LinksFunction to V2_LinksFunction
  root.find(j.TSTypeReference, { typeName: { name: 'LinksFunction' } })
    .forEach(path => {
      path.node.typeName.name = 'V2_LinksFunction';
      dirtyFlag = true;
    });

  // Step 2: Rename properties in the returned array
  root.find(j.ObjectExpression)
    .forEach(path => {
      path.node.properties.forEach(prop => {
        if (j.ObjectProperty.check(prop) && j.Identifier.check(prop.key)) {
          if (prop.key.name === 'imagesrcset') {
            prop.key.name = 'imageSrcSet';
            dirtyFlag = true;
          } else if (prop.key.name === 'imagesizes') {
            prop.key.name = 'imageSizes';
            dirtyFlag = true;
          }
        }
      });
    });

  return dirtyFlag ? root.toSource() : undefined;
}