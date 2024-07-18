import { basename } from "node:path";
import type { Filemod } from "@codemod-com/filemod";
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
    // type Field = {
    //   name: string;
    //   type: string;
    //   attributes: string;
    //   isRelation: boolean;
    // };

    // type Model = {
    //   [key: string]: Field[];
    // };

    // const modelRegex: RegExp = /model (\w+) \{([^}]+)\}/g;
    // const fieldRegex: RegExp = /(\w+)\s+(\w+(\[\])?)\s*(.*)/;

    // const models: Model = {};
    // let match: RegExpExecArray | null;

    // const modelNames: string[] = [];
    // while ((match = modelRegex.exec(prismaSchema)) !== null) {
    //   modelNames.push(match[1]);
    // }

    // modelRegex.lastIndex = 0;

    // while ((match = modelRegex.exec(prismaSchema)) !== null) {
    //   const modelName: string = match[1];
    //   const modelBody: string = match[2];
    //   const fields: Field[] = [];

    //   modelBody.split("\n").forEach((line) => {
    //     const fieldMatch: RegExpExecArray | null = fieldRegex.exec(line.trim());
    //     if (fieldMatch) {
    //       const fieldName = fieldMatch[1];
    //       const fieldType = fieldMatch[2];
    //       const fieldAttributes = fieldMatch[4];
    //       const isRelation = modelNames.includes(
    //         fieldType.replace(/\[\]/, "").replace("?", ""),
    //       );
    //       fields.push({
    //         name: fieldName,
    //         type: fieldType,
    //         attributes: fieldAttributes,
    //         isRelation,
    //       });
    //     }
    //   });

    //   models[modelName] = fields;
    // }

    // const result: Model = {};

    // Object.keys(models).forEach((modelName) => {
    //   const fields = models[modelName].filter(
    //     (field) => field.isRelation && field.attributes.includes("?"),
    //   );
    //   if (fields.length > 0) {
    //     result[modelName] = fields;
    //   }
    // });

    // return result;
    return {};
  },
  handleFile: async (_api, path, options, state) => {
    const fileName = basename(path);
    if (fileName === "schema.prisma") {
      return [];
    }

    return [{ kind: "upsertFile", path, options, state }];
  },
  handleData: async (api, path, data, options, state) => {
    const { jscodeshift } = api.getDependencies();
    const j = jscodeshift.withParser("tsx");
    const root = j(data);

    // const importedIdentifiers: string[] = [];

    // root
    //   .find(j.ImportDeclaration, {
    //     source: {
    //       value: "@prisma/client",
    //     },
    //   })
    //   .forEach((path) => {
    //     path.node.specifiers.forEach((specifier) => {
    //       if (j.ImportSpecifier.check(specifier) && specifier.local) {
    //         importedIdentifiers.push(specifier.local.name);
    //       }
    //     });
    //   });

    // Object.keys(state).forEach((model) => {
    //   nullableRelations[model].forEach((relation) => {
    //     const nullableType = `${relation.type}NullableRelationFilter`;
    //     const originalType = `${relation.type}RelationFilter`;

    //     root
    //       .find(j.ImportDeclaration, {
    //         source: {
    //           value: "@prisma/client",
    //         },
    //       })
    //       .forEach((path) => {
    //         path.node.specifiers.forEach((specifier) => {
    //           if (j.ImportSpecifier.check(specifier) && specifier.local) {
    //             if (specifier.local.name === originalType) {
    //               path.node.specifiers.push(
    //                 j.importSpecifier(j.identifier(nullableType)),
    //               );
    //             }
    //           }
    //         });
    //       });

    //     root.find(j.Identifier, { name: originalType }).forEach((path) => {
    //       if (
    //         path.parent.node.typeAnnotation &&
    //         path.parent.node.typeAnnotation.typeAnnotation
    //       ) {
    //         const typeAnnotation =
    //           path.parent.node.typeAnnotation.typeAnnotation;
    //         if (
    //           typeAnnotation.type === "TSTypeReference" &&
    //           typeAnnotation.typeName.name === originalType
    //         ) {
    //           path.replace(j.identifier(nullableType));
    //         }
    //       }
    //     });
    //   });
    // });

    return root.toSource();
  },
};
