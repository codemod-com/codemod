export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all function declarations
  root.find(j.FunctionDeclaration).forEach(path => {
    const { node } = path;
    // Check if the function name is 'translateWithNs'
    if (node.id && node.id.name === 'translateWithNs') {
      // Find the parameter named 'ns'
      const nsParam = node.params.find(param => param.name === 'ns');
      if (nsParam && !nsParam.typeAnnotation) {
        // Add type annotation to 'ns' parameter
        nsParam.typeAnnotation = j.typeAnnotation(j.genericTypeAnnotation(j.identifier('Namespace'), null));
        dirtyFlag = true;
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}