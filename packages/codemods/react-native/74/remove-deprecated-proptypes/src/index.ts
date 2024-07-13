import type { API, FileInfo, Options } from 'jscodeshift';

function transform(
  file: FileInfo,
  api: API,
  options: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isModified = false;

  // Helper function to mark file as modified
  const markModified = () => {
    isModified = true;
  };

  // Remove PropTypes import
  root.find(j.ImportDeclaration, {
    source: { value: 'prop-types' },
  }).forEach((path) => {
    j(path).remove();
    markModified();
  });

  // Remove MyComponent.propTypes assignment
  root.find(j.ExpressionStatement).forEach((path) => {
    const expression = path.node.expression;

    if (
      j.AssignmentExpression.check(expression) &&
      j.MemberExpression.check(expression.left) &&
      j.Identifier.check(expression.left.object) &&
      expression.left.object.name === 'MyComponent' &&
      j.Identifier.check(expression.left.property) &&
      expression.left.property.name === 'propTypes'
    ) {
      j(path).remove();
      markModified();
    }
  });

  if (!isModified) {
    return undefined;
  }

  return root.toSource(options);
}

export default transform;