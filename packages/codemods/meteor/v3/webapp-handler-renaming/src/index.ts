export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Replace WebApp.connectHandlers with WebApp.handlers
  root
    .find(j.MemberExpression, {
      object: { name: "WebApp" },
      property: { name: "connectHandlers" },
    })
    .forEach((path) => {
      path.get("property").replace(j.identifier("handlers"));
      dirtyFlag = true;
    });

  // Replace WebApp.rawConnectHandlers with WebApp.rawHandlers
  root
    .find(j.MemberExpression, {
      object: { name: "WebApp" },
      property: { name: "rawConnectHandlers" },
    })
    .forEach((path) => {
      path.get("property").replace(j.identifier("rawHandlers"));
      dirtyFlag = true;
    });

  // Replace WebApp.connectApp with WebApp.expressApp
  root
    .find(j.MemberExpression, {
      object: { name: "WebApp" },
      property: { name: "connectApp" },
    })
    .forEach((path) => {
      path.get("property").replace(j.identifier("expressApp"));
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
