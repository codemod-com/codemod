import type {
  API,
  ArrowFunctionExpression,
  FileInfo,
  Options,
} from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;

  return j(file.source)
      .find(j.VariableDeclaration)
      .filter((path) => {
          // Check if it matches `const StyleDictionary = require('style-dictionary');`
          const declaration = path.node.declarations[0];
          return (
              declaration.id.name === 'StyleDictionary' &&
              j.CallExpression.check(declaration.init) &&
              declaration.init.callee.name === 'require' &&
              declaration.init.arguments.length === 1 &&
              declaration.init.arguments[0].value === 'style-dictionary'
          );
      })
      .replaceWith((path) => {
          // Replace with `import StyleDictionary from 'style-dictionary';`
          return j.importDeclaration(
              [j.importDefaultSpecifier(j.identifier('StyleDictionary'))],
              j.literal('style-dictionary'),
          );
      })
      .toSource();
}

