export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all CallExpressions
  root.find(j.CallExpression).forEach(path => {
    const { callee } = path.node;

    // Check if the callee is a MemberExpression
    if (j.MemberExpression.check(callee)) {
      const { object, property } = callee;

      // Check if the object is another CallExpression
      if (j.CallExpression.check(object)) {
        const { callee: innerCallee } = object;

        // Check if the inner callee is a MemberExpression
        if (j.MemberExpression.check(innerCallee)) {
          const { object: innerObject, property: innerProperty } = innerCallee;

          // Check if the inner object is an Identifier named 'pointerLockControls'
          if (j.Identifier.check(innerObject) && innerObject.name === 'pointerLockControls') {
            // Check if the inner property is an Identifier named 'getObject'
            if (j.Identifier.check(innerProperty) && innerProperty.name === 'getObject') {
              // Replace 'pointerLockControls.getObject()' with 'controls.object'
              path.node.callee = j.memberExpression(
                j.memberExpression(j.identifier('controls'), j.identifier('object')),
                property
              );
              dirtyFlag = true;
            }
          }
        }
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}