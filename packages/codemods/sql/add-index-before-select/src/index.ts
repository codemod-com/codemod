import type { Api, SgNode } from "@codemod.com/workflow";

// Debug with this function
// const renderNode = (node: any, ident = 0) => {
//   console.log(" ".repeat(ident), node.kind());
//   node.children().forEach((child: any) => {
//     renderNode(child, ident + 2);
//   });
// };

const findIdFields = (node: SgNode) =>
  node
    .findAll({ rule: { kind: "identifier" } })
    .map((n) => n.text())
    .filter((id) => id.endsWith("_id"));

const getTableName = (node: SgNode) =>
  node
    .find({
      rule: { kind: "identifier", inside: { kind: "from_item" } },
    })
    ?.text();

export async function workflow({ files }: Api) {
  await files("**/*.sql")
    .astGrep({
      rule: {
        any: [{ pattern: "SELECT $$$ALL" }, { pattern: "select $$$ALL" }],
      },
    })
    .replace(({ getMultipleMatches, getNode }) => {
      const rest = getMultipleMatches("ALL");
      const allIdFields = [] as string[];
      let tableName: string | undefined;
      rest.forEach((node) => {
        if (node.kind() === "from_clause") {
          tableName = getTableName(node);
        } else {
          const idFields = findIdFields(node);
          for (const idField of idFields) {
            if (!allIdFields.includes(idField)) {
              allIdFields.push(idField);
            }
          }
        }
      });

      if (tableName && allIdFields.length) {
        return `${allIdFields.map((idField) => `CREATE INDEX idx_${idField} ON ${tableName}(${idField});`).join("\n")}
${getNode().text()}`;
      }

      return undefined;
    });
}
