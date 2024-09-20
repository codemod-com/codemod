import type { Api } from "@codemod.com/workflow";
const fs = require("node:fs");
const fg = require("fast-glob");

const routeWithComponentPattern = `
  export const $C = createFileRoute($B)({
    component: $A,
    loader: $D,
  });
`;

const routeWithoutComponentPattern = `
  export const $C = createFileRoute($B)({
    loader: $D,
  });
`;

const functionPattern = `function $FUNC($$$ARGS) { $$$ }`;

const lazyImportStatement = `import { createLazyFileRoute } from '@tanstack/react-router';`;

export async function workflow({ files, astGrep, contexts }: Api) {
  const matchedRoutes = await files("src/routes/**/*.tsx")
    .jsFam()
    .astGrep(routeWithComponentPattern)
    .map(({ getNode, file, getMatch }) => ({
      code: getNode().text(),
      componentcode: getMatch("A").text(),
      filename: contexts.getFileContext().file,
    }));

  // Map to store function names and their corresponding code
  const functionMap = new Map<string, string>();

  // Gather all functions
  const functionFiles = await files("src/routes/**/*.tsx")
    .jsFam()
    .astGrep(functionPattern)
    .map(({ getNode, getMatch }) => {
      const functionCode = getNode().text();
      const functionName = getMatch("FUNC").text();
      functionMap.set(functionName, functionCode);
    });

  for (const routes of matchedRoutes) {
    const { code, filename, componentcode } = routes;

    const newLazyFilename = filename.replace(/\.tsx$/, ".lazy.tsx");

    // Read original file content
    const fileContent = fs.readFileSync(filename, "utf-8");

    // Extract all import statements
    const importStatements =
      fileContent.match(/^import\s.+from\s+['"].+['"];?/gm) || [];

    // Process each import statement
    const filteredImports = importStatements
      .map((importStatement) => {
        if (importStatement.includes("createFileRoute")) {
          // Remove only createFileRoute from the import statement
          const updatedImport = importStatement
            .replace(/createFileRoute\s*,?\s*/, "")
            .trim();

          // If the updated import statement has an empty import clause, remove it entirely
          if (updatedImport.match(/^import\s*\{\s*\}\s*from\s+['"].+['"];?/)) {
            return null; // Mark this import for removal
          }

          return updatedImport;
        }
        return importStatement;
      })
      .filter(Boolean); // Remove any null entries

    const match = code.match(
      /export const (\w+) = createFileRoute\((.*?)\)\(\{\s*component: (.*?),\s*loader: (.*?)\s*\}\);/s,
    );

    if (match) {
      const [_, routeName, routePath, componentName] = match;

      const matchedFunction = functionMap.get(componentName);

      let newLazyCode = `${lazyImportStatement}\n${filteredImports.join("\n")}\n\nexport const ${routeName} = createLazyFileRoute(${routePath})({
  component: ${componentName},
});`;

      if (matchedFunction) {
        newLazyCode += `\n${matchedFunction}`;
      }

      fs.writeFileSync(newLazyFilename, newLazyCode);
      console.log(`Created lazy route file: ${newLazyFilename}`);

      console.log(`Updated original route file: ${filename}`);
    } else {
      console.error(`Pattern match failed in file: ${filename}`);
    }
  }

  await files("src/routes/**/*.tsx")
    .jsFam()
    .astGrep(routeWithComponentPattern)
    .replace(routeWithoutComponentPattern);

  // Remove functions only if they are matched
  const filesToUpdate = fg.sync("src/routes/**/*", {
    ignore: "**/*.lazy.tsx",
  });

  for (const file of filesToUpdate) {
    let fileContent = fs.readFileSync(file, "utf-8");
    for (const [functionName, functionCode] of functionMap) {
      if (!fileContent.includes(functionCode)) continue;

      if (matchedRoutes.some((route) => route.componentcode === functionName)) {
        fileContent = fileContent.replace(functionCode, "");
        fs.writeFileSync(file, fileContent);
        console.log(`Removed function ${functionName} from file: ${file}`);
      }
    }
  }
}
