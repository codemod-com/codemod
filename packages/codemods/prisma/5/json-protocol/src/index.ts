import type { Filemod } from "@codemod-com/filemod";
import {
  type Schema,
  createPrismaSchemaBuilder,
  getSchema,
} from "@mrleebo/prisma-ast";
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

    let schema: Schema;
    try {
      schema = getSchema(prismaSchema);
    } catch (err) {
      throw new Error("Could not parse the schema.prisma file.");
    }

    return { schema };
  },
  handleFile: async (api, path, options, state) => {
    state?.schema?.list.forEach((block) => {
      console.log(block);
    });

    return [];
    // const fileName = path.split(sep).at(-1);
    // const biomePath = api.joinPaths(api.currentWorkingDirectory, "biome.json");
    // if (fileName === "package.json") {
    //   return [
    //     // FIRST (!), update biome.json linter.ignore based on eslintIgnore key
    //     {
    //       kind: "upsertFile",
    //       path,
    //       options: {
    //         biomeJsonStringContent: await api.readFile(biomePath),
    //       },
    //     },
    //     // Then, update package.json and remove all eslint-related keys
    //     {
    //       kind: "upsertFile",
    //       path,
    //       options,
    //     },
    //   ];
    // }
    // return [
    //   {
    //     kind: "upsertFile",
    //     path,
    //     options: {
    //       biomeJsonStringContent: await api.readFile(biomePath),
    //     },
    //   },
    //   {
    //     kind: "deleteFile",
    //     path,
    //   },
    // ];
  },
  handleData: async (
    api,
    path,
    data,
    options: {
      biomeJsonStringContent?: string;
    },
    state,
  ) => {
    // const fileName = path.split(sep).at(-1)!;
    // const biomePath = api.joinPaths(api.currentWorkingDirectory, "biome.json");

    console.log(state?.schema);

    return { kind: "noop" };
  },
};
