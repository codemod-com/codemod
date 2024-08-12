import type { Api } from "@codemod.com/workflow";

const sortOrder = ["import", "require"];

export async function workflow({ files }: Api) {
  await files("**/package.json")
    .json()
    .update<{
      exports?: { [key: string]: { require?: string; import?: string } };
    }>((json) => {
      if (typeof json?.exports === "object") {
        json.exports = Object.fromEntries(
          Object.entries(json.exports).map(([key, values]) => {
            if (typeof values === "object") {
              return [
                key,
                Object.fromEntries(
                  Object.entries(values).sort(([a], [b]) => {
                    if (sortOrder.includes(a) && sortOrder.includes(b)) {
                      return sortOrder.indexOf(a) > sortOrder.indexOf(b)
                        ? 1
                        : -1;
                    }

                    return 0;
                  }),
                ),
              ];
            }

            return [key, values];
          }),
        );
      }

      return json;
    });
}
