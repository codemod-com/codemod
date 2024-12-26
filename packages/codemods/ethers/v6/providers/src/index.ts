export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Transform `new ethers.providers.Web3Provider(window.ethereum)` to `new ethers.BrowserProvider(window.ethereum)`
  root
    .find(j.NewExpression, {
      callee: {
        object: { object: { name: "ethers" }, property: { name: "providers" } },
        property: { name: "Web3Provider" },
      },
    })
    .forEach((path) => {
      path.node.callee = j.memberExpression(
        j.identifier("ethers"),
        j.identifier("BrowserProvider"),
      );
      dirtyFlag = true;
    });

  // Transform `provider.sendTransaction(signedTx)` to `provider.broadcastTransaction(signedTx)`
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "provider" },
        property: { name: "sendTransaction" },
      },
    })
    .forEach((path) => {
      path.node.callee.property.name = "broadcastTransaction";
      dirtyFlag = true;
    });

  // Transform `new StaticJsonRpcProvider(url, network)` to `new JsonRpcProvider(url, network, { staticNetwork: network })`
  root
    .find(j.NewExpression, {
      callee: { name: "StaticJsonRpcProvider" },
    })
    .forEach((path) => {
      const [url, network] = path.node.arguments;
      path.node.callee = j.identifier("JsonRpcProvider");
      path.node.arguments = [
        url,
        network,
        j.objectExpression([
          j.property.from({
            kind: "init",
            key: j.identifier("staticNetwork"),
            value: network,
            shorthand: true,
          }),
        ]),
      ];
      dirtyFlag = true;
    });

  // Transform `await provider.getGasPrice()` to `(await provider.getFeeData()).gasPrice`
  root
    .find(j.AwaitExpression, {
      argument: {
        callee: {
          object: { name: "provider" },
          property: { name: "getGasPrice" },
        },
      },
    })
    .forEach((path) => {
      path.replace(
        j.memberExpression(
          j.awaitExpression(
            j.callExpression(
              j.memberExpression(
                j.identifier("provider"),
                j.identifier("getFeeData"),
              ),
              [],
            ),
          ),
          j.identifier("gasPrice"),
        ),
      );
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
