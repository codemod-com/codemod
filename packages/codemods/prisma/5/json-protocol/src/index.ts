import { basename } from "node:path";
import type { Identifier } from "jscodeshift";

import type { Filemod } from "@codemod-com/filemod";
import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { getSchema } from "@mrleebo/prisma-ast";
import { prismaMethodNames, scalarTypes } from "./constants.js";
import type { Dependencies, Options } from "./types.js";

export const repomod: Filemod<Dependencies, Options> = {
  includePatterns: ["**/*.{ts,js}", "**/schema.prisma"],
  excludePatterns: ["**/node_modules/**"],
  initializeState: async (_options, _prev, api, paths) => {
    const prismaSchemaPath = paths?.find((path) =>
      path.endsWith("schema.prisma"),
    );

    if (!prismaSchemaPath) {
      throw new Error("Could not find schema.prisma file in the file list.");
    }

    let prismaSchema: string;
    try {
      prismaSchema = await api.fileAPI.readFile(prismaSchemaPath);
    } catch (err) {
      throw new Error("Could not find read from schema.prisma file.");
    }

    const schema = getSchema(prismaSchema);

    const pairs = schema.list.reduce(
      (acc, node) => {
        if (node.type === "model") {
          const modelName = `${node.name.at(0)?.toLowerCase()}${node.name.slice(1)}`;

          acc[modelName] = node.properties
            .filter((prop) => prop.type === "field")
            .filter(
              (prop) =>
                typeof prop.fieldType === "string" &&
                (prop.fieldType === "Json" || prop.array === true),
            )
            .map((prop) => ({
              name: prop.name,
              type: prop.array
                ? `${prop.fieldType}[]`
                : (prop.fieldType as string),
            }));
        }

        return acc;
      },
      {} as Options["pairs"],
    );

    return { pairs };
  },
  handleFile: async (_api, path, options, state) => {
    const fileName = basename(path);
    if (fileName === "schema.prisma") {
      return [];
    }

    return [{ kind: "upsertFile", path, options, state }];
  },
  handleData: async (api, path, data, options, state) => {
    const { j } = api.getDependencies();
    const root = j(data);

    root.find(j.CallExpression).forEach((path) => {
      if (!j.MemberExpression.check(path.node.callee)) {
        return;
      }

      if (!j.Identifier.check(path.node.callee.property)) {
        return;
      }

      const callMethod = path.node.callee.property.name;
      if (!prismaMethodNames.includes(callMethod)) {
        return;
      }

      const calledByModel = j(path.node.callee.object)
        .find(j.Identifier)
        .nodes()
        .at(-1)?.name;
      if (!calledByModel) {
        return;
      }

      const callArgument = path.node.arguments[0];

      if (!j.ObjectExpression.check(callArgument)) {
        return;
      }

      callArgument.properties.forEach((prop) => {
        if (
          !j.Property.check(prop) ||
          !j.Identifier.check(prop.key) ||
          !j.ObjectExpression.check(prop.value)
        ) {
          return;
        }

        if (!["where", "data"].includes(prop.key.name)) {
          return;
        }

        prop.value.properties.forEach((fieldProp) => {
          if (
            !j.Property.check(fieldProp) ||
            !j.Identifier.check(fieldProp.key)
          ) {
            return;
          }

          const field = state?.pairs[calledByModel]?.find(
            (pair) => pair.name === (fieldProp.key as Identifier).name,
          );

          // Fixture #2 (Scalar arrays)
          if (
            field &&
            scalarTypes.some((scalar) => field.type.includes(scalar)) &&
            j.Literal.check(fieldProp.value)
          ) {
            fieldProp.value = j.arrayExpression([fieldProp.value]);
            return;
          }

          if (j.ObjectExpression.check(fieldProp.value)) {
            // Fixture #4 (OR/AND single condition not wrapped in an array)
            if (["OR", "AND"].includes(fieldProp.key.name)) {
              fieldProp.value = j.arrayExpression([fieldProp.value]);
              return;
            }

            fieldProp.value.properties.forEach((filterProp) => {
              if (
                !j.Property.check(filterProp) ||
                !j.Identifier.check(filterProp.key)
              ) {
                return;
              }

              // Fixture #3 (Json path property)
              if (
                field?.type === "Json" &&
                filterProp.key.name === "path" &&
                j.Literal.check(filterProp.value)
              ) {
                filterProp.value = j.arrayExpression([filterProp.value]);
              }

              // Fixture #5 (in/notIn condition not wrapped in an array)

              if (
                ["in", "notIn"].includes(filterProp.key.name) &&
                j.Literal.check(filterProp.value)
              ) {
                filterProp.value = j.arrayExpression([filterProp.value]);
              }
            });

            // Fixture #1 (Composite lists)

            // If not a scalar, quit prematurely
            if (
              !field ||
              scalarTypes.some((scalar) => field.type.includes(scalar))
            ) {
              return;
            }

            const longNotationFilterProp = fieldProp.value.properties.find(
              (filterProp) => {
                if (
                  !j.Property.check(filterProp) ||
                  !j.Identifier.check(filterProp.key)
                ) {
                  return;
                }

                return filterProp.key.name === "equals";
              },
            );

            // If it's a long notation, covers fixture #1, case #1
            if (
              isNeitherNullNorUndefined(longNotationFilterProp) &&
              j.Property.check(longNotationFilterProp) &&
              j.ObjectExpression.check(longNotationFilterProp.value)
            ) {
              longNotationFilterProp.value = j.arrayExpression([
                longNotationFilterProp.value,
              ]);
              // If it's a short notation, covers fixture #1, cases #2 and #3
            } else {
              fieldProp.value = j.arrayExpression([fieldProp.value]);
            }

            return;
          }
        });
      });
    });

    return { kind: "upsertData", data: root.toSource(), path };
  },
};
