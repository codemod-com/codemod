import type { Api } from "@codemod.com/workflow";

const sortOrder = ["require", "import"];

export async function workflow({ files }: Api) {
  await files("**/package.json")
    .json()
    .update<{ exports?: { "."?: { require?: string; import?: string } } }>(
      (json) => {
        if (typeof json?.exports?.["."] === "object") {
          json.exports["."] = Object.fromEntries(
            Object.entries(json.exports["."]).sort(([a], [b]) => {
              if (sortOrder.includes(a) && sortOrder.includes(b)) {
                return sortOrder.indexOf(a) > sortOrder.indexOf(b) ? 1 : -1;
              }

              return 0;
            }),
          );
        }

        return json;
      },
    );
}
