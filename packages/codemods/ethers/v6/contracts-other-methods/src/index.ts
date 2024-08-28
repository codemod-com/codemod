export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Helper function to transform the method calls
  function transformMethodCall(path, newMethod) {
    const { object, property } = path.value.callee;
    if (j.MemberExpression.check(object) && j.Identifier.check(object.property)) {
      const newCallee = j.memberExpression(
        j.memberExpression(object.object, property),
        j.identifier(newMethod)
      );
      path.value.callee = newCallee;
      dirtyFlag = true;
    }
  }

  // Transform contract.functions.foo(addr) to contract.foo.staticCallResult(addr)
  root.find(j.CallExpression, {
    callee: {
      object: { object: { name: 'contract' }, property: { name: 'functions' } }
    }
  }).forEach(path => transformMethodCall(path, 'staticCallResult'));

  // Transform contract.callStatic.foo(addr) to contract.foo.staticCall(addr)
  root.find(j.CallExpression, {
    callee: {
      object: { object: { name: 'contract' }, property: { name: 'callStatic' } }
    }
  }).forEach(path => transformMethodCall(path, 'staticCall'));

  // Transform contract.estimateGas.foo(addr) to contract.foo.estimateGas(addr)
  root.find(j.CallExpression, {
    callee: {
      object: { object: { name: 'contract' }, property: { name: 'estimateGas' } }
    }
  }).forEach(path => transformMethodCall(path, 'estimateGas'));

  // Transform contract.populateTransaction.foo(addr) to contract.foo.populateTransaction(addr)
  root.find(j.CallExpression, {
    callee: {
      object: { object: { name: 'contract' }, property: { name: 'populateTransaction' } }
    }
  }).forEach(path => transformMethodCall(path, 'populateTransaction'));

  return dirtyFlag ? root.toSource() : undefined;
}