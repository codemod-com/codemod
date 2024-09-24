export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace MyCollection.find().fetch() with MyCollection.find().fetchAsync()
  root.find(j.CallExpression, {
    callee: {
      object: {
        callee: {
          object: { name: 'MyCollection' },
          property: { name: 'find' }
        }
      },
      property: { name: 'fetch' }
    }
  }).forEach(path => {
    if (j.Identifier.check(path.node.property)) {
      path.node.property.name = 'fetchAsync';
      dirtyFlag = true;
    }
  });

  // Replace Meteor.call with Meteor.callAsync and add await
  root.find(j.CallExpression, {
    callee: {
      object: { name: 'Meteor' },
      property: { name: 'call' }
    }
  }).forEach(path => {
    if (j.Identifier.check(path.node.callee.property)) {
      path.node.callee.property.name = 'callAsync';
      const parent = path.parent.node;
      if (!j.AwaitExpression.check(parent)) {
        j(path).replaceWith(j.awaitExpression(path.node));
      }
      dirtyFlag = true;
    }
  });

  // Ensure that the fetchAsync changes are applied within Meteor.methods
  root.find(j.ObjectMethod, {
    key: { type: 'Identifier' },
    async: true
  }).forEach(path => {
    j(path).find(j.CallExpression, {
      callee: {
        object: {
          callee: {
            object: { name: 'MyCollection' },
            property: { name: 'find' }
          }
        },
        property: { name: 'fetch' }
      }
    }).forEach(innerPath => {
      if (j.Identifier.check(innerPath.node.property)) {
        innerPath.node.property.name = 'fetchAsync';
        dirtyFlag = true;
      }
    });
  });

  return dirtyFlag ? root.toSource() : undefined;
}