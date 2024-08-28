export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace splitSignature with ethers.Signature.from
  root.find(j.AssignmentExpression, {
    right: {
      type: 'CallExpression',
      callee: { name: 'splitSignature' }
    }
  }).forEach(path => {
    const { node } = path;
    if (j.Identifier.check(node.left) && node.left.name === 'splitSig') {
      node.right = j.callExpression(
        j.memberExpression(
          j.memberExpression(j.identifier('ethers'), j.identifier('Signature')),
          j.identifier('from')
        ),
        node.right.arguments
      );
      dirtyFlag = true;
    }
  });

  // Replace joinSignature with ethers.Signature.from and access serialized property
  root.find(j.AssignmentExpression, {
    right: {
      type: 'CallExpression',
      callee: { name: 'joinSignature' }
    }
  }).forEach(path => {
    const { node } = path;
    if (j.Identifier.check(node.left) && node.left.name === 'sigBytes') {
      node.right = j.memberExpression(
        j.callExpression(
          j.memberExpression(
            j.memberExpression(j.identifier('ethers'), j.identifier('Signature')),
            j.identifier('from')
          ),
          node.right.arguments
        ),
        j.identifier('serialized')
      );
      dirtyFlag = true;
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}