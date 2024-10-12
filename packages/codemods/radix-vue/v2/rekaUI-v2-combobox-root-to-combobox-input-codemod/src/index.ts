export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all ComboboxRoot elements
  root.find(j.JSXElement, { openingElement: { name: { name: "ComboboxRoot" } } })
    .forEach(path => {
      const openingElement = path.value.openingElement;
      const children = path.value.children;

      // Find v-model:search-term and :display-value attributes
      let searchTermAttr, displayValueAttr;
      openingElement.attributes = openingElement.attributes.filter(attr => {
        if (j.JSXAttribute.check(attr) && j.JSXIdentifier.check(attr.name)) {
          if (attr.name.name === 'v-model:search-term') {
            searchTermAttr = attr;
            return false;
          }
          if (attr.name.name === ':display-value') {
            displayValueAttr = attr;
            return false;
          }
        }
        return true;
      });

      if (searchTermAttr && displayValueAttr) {
        dirtyFlag = true;

        // Create new ComboboxInput element
        const comboboxInput = j.jsxElement(
          j.jsxOpeningElement(
            j.jsxIdentifier('ComboboxInput'),
            [
              j.jsxAttribute(j.jsxIdentifier('v-model'), searchTermAttr.value),
              displayValueAttr
            ]
          ),
          j.jsxClosingElement(j.jsxIdentifier('ComboboxInput')),
          children
        );

        // Replace children with the new ComboboxInput element
        path.value.children = [j.jsxText("\n    "), comboboxInput, j.jsxText("\n  ")];
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}