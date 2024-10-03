export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Update NavigationMenuLinkEmits type
  root.find(j.TSTypeAliasDeclaration, { id: { name: 'NavigationMenuLinkEmits' } })
    .forEach(path => {
      const selectProperty = path.value.typeAnnotation.members.find(member =>
        j.TSPropertySignature.check(member) && j.Identifier.check(member.key) && member.key.name === 'select'
      );
      if (selectProperty && j.TSTupleType.check(selectProperty.typeAnnotation)) {
        selectProperty.typeAnnotation.elementTypes = [
          j.tsTypeReference(
            j.identifier('CustomEvent'),
            j.tsTypeParameterInstantiation([
              j.tsTypeLiteral([
                j.tsPropertySignature(
                  j.identifier('originalEvent'),
                  j.tsTypeAnnotation(j.tsTypeReference(j.identifier('Event')))
                )
              ])
            ])
          )
        ];
        dirtyFlag = true;
      }
    });

  // Add LINK_SELECT import
  root.find(j.ImportDeclaration, { source: { value: './utils' } })
    .forEach(path => {
      const hasLinkSelect = path.value.specifiers.some(specifier =>
        j.ImportSpecifier.check(specifier) && specifier.imported.name === 'LINK_SELECT'
      );
      if (!hasLinkSelect) {
        path.value.specifiers.push(j.importSpecifier(j.identifier('LINK_SELECT')));
        dirtyFlag = true;
      }
    });

  // Update handleClick function
  root.find(j.FunctionDeclaration)
    .filter(path => j.Identifier.check(path.value.id) && path.value.id.name === 'handleClick')
    .forEach(path => {
      const body = path.value.body.body;
      const nextTickIndex = body.findIndex(statement =>
        j.ExpressionStatement.check(statement) &&
        j.AwaitExpression.check(statement.expression) &&
        j.CallExpression.check(statement.expression.argument) &&
        j.Identifier.check(statement.expression.argument.callee) &&
        statement.expression.argument.callee.name === 'nextTick'
      );
      if (nextTickIndex !== -1) {
        body.splice(nextTickIndex, 1);
        dirtyFlag = true;
      }

      const emitIndex = body.findIndex(statement =>
        j.ExpressionStatement.check(statement) &&
        j.CallExpression.check(statement.expression) &&
        j.Identifier.check(statement.expression.callee) &&
        statement.expression.callee.name === 'emits'
      );
      if (emitIndex !== -1) {
        const emitCall = body[emitIndex].expression;
        const linkSelectEvent = j.variableDeclaration('const', [
          j.variableDeclarator(
            j.identifier('linkSelectEvent'),
            j.newExpression(j.identifier('CustomEvent'), [
              j.identifier('LINK_SELECT'),
              j.objectExpression([
                j.property.from({ kind: 'init', key: j.identifier('bubbles'), value: j.literal(true) }),
                j.property.from({ kind: 'init', key: j.identifier('cancelable'), value: j.literal(true) }),
                j.property.from({
                  kind: 'init',
                  key: j.identifier('detail'),
                  value: j.objectExpression([
                    j.property.from({ kind: 'init', key: j.identifier('originalEvent'), value: j.identifier('ev') })
                  ])
                })
              ])
            ])
          )
        ]);
        body.splice(emitIndex, 0, linkSelectEvent);
        emitCall.arguments[1] = j.identifier('linkSelectEvent');
        dirtyFlag = true;
      }

      const defaultPreventedCheck = body.find(statement =>
        j.IfStatement.check(statement) &&
        j.BinaryExpression.check(statement.test) &&
        j.MemberExpression.check(statement.test.left) &&
        j.Identifier.check(statement.test.left.object) &&
        statement.test.left.object.name === 'ev' &&
        statement.test.left.property.name === 'defaultPrevented'
      );
      if (defaultPreventedCheck) {
        defaultPreventedCheck.test.left.object.name = 'linkSelectEvent';
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}