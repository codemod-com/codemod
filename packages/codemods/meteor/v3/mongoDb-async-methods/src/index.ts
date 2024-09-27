export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Helper function to check if the call expression is already awaited
  const isAwaited = (path) => {
    return j.AwaitExpression.check(path.parent.node);
  };

  // Transform `fetch` to `fetchAsync` and add `await`
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: { name: "fetch" },
      },
    })
    .forEach((path) => {
      const memberExpr = path.node.callee;
      if (j.MemberExpression.check(memberExpr)) {
        memberExpr.property.name = "fetchAsync";
        // Only add `await` if it's not already awaited
        if (!isAwaited(path)) {
          const awaitExpr = j.awaitExpression(path.node);
          j(path).replaceWith(awaitExpr);
        }
        dirtyFlag = true;
      }
    });

  // Transform `findOne` to `findOneAsync` and add `await`
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: { name: "findOne" },
      },
    })
    .forEach((path) => {
      const memberExpr = path.node.callee;
      if (j.MemberExpression.check(memberExpr)) {
        memberExpr.property.name = "findOneAsync";
        // Only add `await` if it's not already awaited
        if (!isAwaited(path)) {
          const awaitExpr = j.awaitExpression(path.node);
          j(path).replaceWith(awaitExpr);
        }
        dirtyFlag = true;
      }
    });

  if (dirtyFlag) {
    return root.toSource();
  }

  // Transform MyCollection.* calls to their async counterparts and add `await`
  const collectionMethods = ["insert", "update", "remove", "upsert"];
  collectionMethods.forEach((method) => {
    root
      .find(j.CallExpression, {
        callee: {
          type: "MemberExpression",
          property: { name: method },
        },
      })
      .forEach((path) => {
        const memberExpr = path.node.callee;
        if (j.MemberExpression.check(memberExpr)) {
          memberExpr.property.name = `${method}Async`;
          // Only add `await` if it's not already awaited
          if (!isAwaited(path)) {
            const awaitExpr = j.awaitExpression(path.node);
            j(path).replaceWith(awaitExpr);
          }
          dirtyFlag = true;
        }
      });
  });

  return dirtyFlag ? root.toSource() : undefined;
}
