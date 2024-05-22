import { astGrep, describe, jsFiles, migrate } from "@codemod-com/workflow";
import { kebabCase } from "lodash";

const extractCSS = async () => {
  // Retrieve all the classes and their styles
  const classes = await astGrep`const $CLASSNAME = { $$$STYLES }`
    // Map the react styles to CSS
    .map(({ getNode }) => {
      const node = getNode();
      const className = node.getMatch("CLASSNAME")?.text();
      const styles = node
        .getMultipleMatches("STYLES")
        .filter((n) => n.kind() === "pair")
        .map((n) => ({
          name: kebabCase(n.child(0)?.text()),
          value: JSON.parse(n.child(2)?.text() ?? '""'),
        }));

      return `
.${className} {
${styles.map(({ name, value }) => `  ${name}: ${value};`).join("\n")}
}
`;
    });

  // Join all the classes into a single CSS file
  return classes.join("\n");
};

export const workflow = async () => {
  // For every file that matches the pattern, we will run the callback
  await jsFiles("ButtonBefore.tsx", async ({ astGrep }) => {
    const css = await extractCSS();
    console.log(css);
    // Later we can save css to a file
    // Update JS file with import from CSS file
    // Replace styles with className
  });
};
