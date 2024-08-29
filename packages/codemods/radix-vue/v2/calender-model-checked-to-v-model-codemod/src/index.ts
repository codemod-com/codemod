export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all JSXElements
  root.find(j.JSXElement).forEach(path => {
    const openingElement = path.value.openingElement;

    // Check if the element is CheckboxRoot
    if (j.JSXIdentifier.check(openingElement.name) && openingElement.name.name === 'CheckboxRoot') {
      // Find all attributes
      openingElement.attributes.forEach(attr => {
        // Check if the attribute is v-model:checked
        if (j.JSXAttribute.check(attr) && j.JSXNamespacedName.check(attr.name) && attr.name.namespace.name === 'v-model' && attr.name.name.name === 'checked') {
          // Replace v-model:checked with v-model
          attr.name = j.jsxIdentifier('v-model');
          dirtyFlag = true;
        }
      });
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}