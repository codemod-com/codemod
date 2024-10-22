export default function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Add the <script setup lang="ts"> block with the pagingFunc function
  const scriptSetupBlock = `
<script setup lang="ts">
function pagingFunc(date: DateValue, sign: -1 | 1) { 
  if (sign === -1) 
    return date.subtract({ years: 1 }) 
  return date.add({ years: 1 }) 
} 
</script>
`;

  // Check if the script setup block already exists
  const hasScriptSetup = root.find(j.Program).some(path =>
    path.node.body.some(node =>
      j.Literal.check(node) && node.value.includes('<script setup lang="ts">')
    )
  );

  if (!hasScriptSetup) {
    root.get().node.program.body.unshift(j.template.statement([scriptSetupBlock]));
    dirtyFlag = true;
  }

  // Transform <CalendarPrev step='year' /> to <CalendarPrev :prev-page="(date: DateValue) => pagingFunc(date, -1)" />
  root.find(j.JSXOpeningElement, { name: { name: 'CalendarPrev' } }).forEach(path => {
    const stepAttr = path.node.attributes.find(attr =>
      j.JSXAttribute.check(attr) && attr.name.name === 'step' && attr.value.value === 'year'
    );
    if (stepAttr) {
      path.node.attributes = path.node.attributes.filter(attr => attr !== stepAttr);
      path.node.attributes.push(
        j.jsxAttribute(
          j.jsxIdentifier(':prev-page'),
          j.jsxExpressionContainer(
            j.arrowFunctionExpression(
              [j.identifier('date')],
              j.callExpression(
                j.identifier('pagingFunc'),
                [j.identifier('date'), j.literal(-1)]
              )
            )
          )
        )
      );
      dirtyFlag = true;
    }
  });

  // Transform <CalendarNext step='year' /> to <CalendarNext :next-page="(date: DateValue) => pagingFunc(date, 1)" />
  root.find(j.JSXOpeningElement, { name: { name: 'CalendarNext' } }).forEach(path => {
    const stepAttr = path.node.attributes.find(attr =>
      j.JSXAttribute.check(attr) && attr.name.name === 'step' && attr.value.value === 'year'
    );
    if (stepAttr) {
      path.node.attributes = path.node.attributes.filter(attr => attr !== stepAttr);
      path.node.attributes.push(
        j.jsxAttribute(
          j.jsxIdentifier(':next-page'),
          j.jsxExpressionContainer(
            j.arrowFunctionExpression(
              [j.identifier('date')],
              j.callExpression(
                j.identifier('pagingFunc'),
                [j.identifier('date'), j.literal(1)]
              )
            )
          )
        )
      );
      dirtyFlag = true;
    }
  });

  // Ensure the <template> block is correctly formatted
  root.find(j.JSXElement, { openingElement: { name: { name: 'template' } } }).forEach(path => {
    const children = path.node.children.filter(child => child.type !== 'Literal' || child.value.trim() !== '');
    path.node.children = [j.jsxText('\n  '), ...children, j.jsxText('\n')];
    dirtyFlag = true;
  });

  return dirtyFlag ? root.toSource() : undefined;
}