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
  const source = file.source;

  // Regular expression to find content inside <script> tags and capture the entire opening tag
  const scriptTagRegex = /(<script[^>]*>)([\s\S]*?)(<\/script>)/gm;

  // Variable to hold the transformed source
  let transformedSource = source;
  let scriptFound = false;

  // Function to perform the transformation logic
  function transformCode(code) {
    const root = j(code);

    let needsRenderImport = false;

    // Find any calls to Component.render({...})
    root
      .find(j.CallExpression, {
        callee: {
          property: { name: "render" },
        },
      })
      .forEach((renderPath) => {
        const componentName = renderPath.node.callee.object.name;

        // Replace with `render(Component, { props })`
        j(renderPath).replaceWith(
          j.callExpression(j.identifier("render"), [
            j.identifier(componentName),
            j.objectExpression([
              j.property(
                "init",
                j.identifier("props"),
                renderPath.node.arguments[0],
              ),
            ]),
          ]),
        );

        // Mark that we need to add `import { render } from 'svelte/server'`
        needsRenderImport = true;
      });

    // If `render` was used, ensure the import is added
    if (needsRenderImport) {
      const hasRenderImport = root
        .find(j.ImportDeclaration, {
          source: { value: "svelte/server" },
        })
        .some((path) =>
          path.node.specifiers.some(
            (specifier) => specifier.imported.name === "render",
          ),
        );

      // If not already imported, add the import statement
      if (!hasRenderImport) {
        const firstImport = root.find(j.ImportDeclaration).at(0);

        if (firstImport.size()) {
          firstImport.insertBefore(
            j.importDeclaration(
              [j.importSpecifier(j.identifier("render"))],
              j.literal("svelte/server"),
            ),
          );
        } else {
          // If no import statements, just insert at the top
          root
            .get()
            .node.program.body.unshift(
              j.importDeclaration(
                [j.importSpecifier(j.identifier("render"))],
                j.literal("svelte/server"),
              ),
            );
        }
      }
    }

    return root.toSource();
  }

  // Handle JavaScript inside <script> tags and directly in JavaScript files
  if (file.path.endsWith(".svelte")) {
    transformedSource = transformedSource.replace(
      scriptTagRegex,
      (match, openingTag, scriptContent, closingTag) => {
        scriptFound = true;
        // Transform the extracted JavaScript content from <script> tags
        const transformedScriptContent = transformCode(scriptContent);
        // Replace the original <script> content with the transformed content, preserving the original opening tag
        return `${openingTag}\n${transformedScriptContent}\n${closingTag}`;
      },
    );

    // If no <script> tags were found, assume it's a script-less Svelte file
    if (!scriptFound) {
      transformedSource = transformCode(source);
    }
  } else {
    // Directly transform JavaScript files
    transformedSource = transformCode(source);
  }

  return transformedSource;
}
