module.exports = function (fileInfo, api) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
  
    // Replace import declarations
    root.find(j.ImportDeclaration).forEach(path => {
      path.node.specifiers.forEach(specifier => {
        if (specifier.imported && specifier.imported.name === 'LogLuvLoader') {
          specifier.imported.name = 'UltraHDRLoader';
          specifier.local.name = 'UltraHDRLoader';
        }
      });
  
      // Also replace the source path if it contains LogLuvLoader
      if (path.node.source.value.includes('LogLuvLoader')) {
        path.node.source.value = path.node.source.value.replace('LogLuvLoader', 'UltraHDRLoader');
      }
    });
  
    // Replace export statements
    root.find(j.ExportAllDeclaration).forEach(path => {
      if (path.node.source && path.node.source.value.includes('LogLuvLoader')) {
        path.node.source.value = path.node.source.value.replace('LogLuvLoader', 'UltraHDRLoader');
      }
    });
  
    // Replace New Expressions (instantiation)
    root.find(j.NewExpression, { callee: { name: 'LogLuvLoader' } }).forEach(path => {
      path.node.callee.name = 'UltraHDRLoader';
    });
  
    // Replace identifiers and any other usage
    root.find(j.Identifier, { name: 'LogLuvLoader' }).forEach(path => {
      path.node.name = 'UltraHDRLoader';
    });
  
    // Replace strings that contain 'LogLuvLoader'
    root.find(j.Literal)
      .filter(path => typeof path.node.value === 'string' && path.node.value.includes('LogLuvLoader'))
      .forEach(path => {
        path.node.value = path.node.value.replace(/LogLuvLoader/g, 'UltraHDRLoader');
      });
  
    // Replace Template Literals that contain 'LogLuvLoader'
    root.find(j.TemplateLiteral).forEach(path => {
      path.node.quasis.forEach(quasi => {
        if (quasi.value.raw.includes('LogLuvLoader')) {
          quasi.value.raw = quasi.value.raw.replace(/LogLuvLoader/g, 'UltraHDRLoader');
          quasi.value.cooked = quasi.value.cooked.replace(/LogLuvLoader/g, 'UltraHDRLoader');
        }
      });
    });
  
    return root.toSource();
  };
  