export default function transform(file, api, options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all occurrences of fetcher.submission.formData, fetcher.submission.formMethod, fetcher.submission.formAction
  root.find(j.MemberExpression, {
    object: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'fetcher' },
      property: { name: 'submission' }
    }
  }).forEach(path => {
    const propertyName = path.value.property.name;
    if (['formData', 'formMethod', 'formAction'].includes(propertyName)) {
      // Replace fetcher.submission.<property> with fetcher.<property>
      j(path).replaceWith(
        j.memberExpression(
          j.identifier('fetcher'),
          j.identifier(propertyName)
        )
      );
      dirtyFlag = true;
    }
  });

  // Ensure fetcher.type is retained in the output
  root.find(j.MemberExpression, {
    object: { type: 'Identifier', name: 'fetcher' },
    property: { name: 'type' }
  }).forEach(path => {
    const parent = path.parent;
    if (parent.node.type === 'ExpressionStatement') {
      // Insert a blank line before fetcher.type
      parent.insertBefore(j.expressionStatement(j.literal('')));
    }
  });

  return dirtyFlag ? root.toSource({ quote: 'single', trailingComma: true }) : undefined;
}