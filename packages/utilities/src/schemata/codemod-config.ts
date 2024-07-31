import semver from "semver";
import type { InferInput, InferOutput } from "valibot";
import * as v from "valibot";

import { argumentSchema } from "./argument-record.js";

export const extractLibNameAndVersion = (val: string) => {
  const parts = val.split("@");
  let version: string | null = null;
  let libName: string;
  if (parts.length > 1) {
    version = parts.pop() ?? null;
    libName = parts.join("@");
  } else {
    libName = val;
  }

  return { libName, version };
};

export const codemodNameRegex = /[a-zA-Z0-9_/@-]+/;

export const argumentsSchema = v.array(
  v.union(
    [
      v.object({
        name: v.string(),
        kind: v.literal("string"),
        required: v.optional(v.boolean(), false),
        default: v.optional(v.string()),
      }),
      v.object({
        name: v.string(),
        kind: v.literal("number"),
        required: v.optional(v.boolean(), false),
        default: v.optional(v.number()),
      }),
      v.object({
        name: v.string(),
        kind: v.literal("boolean"),
        required: v.optional(v.boolean(), false),
        default: v.optional(v.boolean()),
      }),
      v.object({
        name: v.string(),
        kind: v.literal("enum"),
        options: v.array(argumentSchema),
        required: v.optional(v.boolean(), false),
        default: v.optional(argumentSchema),
      }),
      v.object({
        name: v.string(),
        kind: v.array(
          v.union([
            v.literal("string"),
            v.literal("number"),
            v.literal("boolean"),
            v.literal("enum"),
          ]),
        ),
        options: v.optional(v.array(argumentSchema)),
        required: v.optional(v.boolean(), false),
        default: v.optional(argumentSchema),
      }),
    ],
    "Invalid arguments definition",
  ),
);

export type Arguments = InferOutput<typeof argumentsSchema>;
export type ArgumentsInput = InferInput<typeof argumentsSchema>;

// Source: https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string

const versionUnion = v.union(
  [
    v.literal("<"),
    v.literal(">"),
    v.literal("="),
    v.literal("<="),
    v.literal(">="),
  ],
  "Invalid version range operator.",
);

const semVerValidationFunc = (val: unknown) =>
  (typeof val === "string" && !!semver.valid(val)) ||
  val === "*" ||
  val === "latest" ||
  val === "next" ||
  val === "canary" ||
  val === "beta" ||
  val === "alpha";

const getSemVerValidationSchema = (msg: string) =>
  v.custom<string>(semVerValidationFunc, msg);

const getLibraryVersionTupleValidator = (msg: string) =>
  v.tuple(
    [
      v.string("Library name has to be a string."),
      versionUnion,
      v.union([
        // react < 18.0.2 (preferred)
        getSemVerValidationSchema(`"version" has to be a valid semver.`),
        // react < 18 (for example, when no latest version of a given major is out yet)
        v.pipe(v.string(), v.regex(/^\d+$/)),
      ]),
    ],
    msg,
  );

const knownEngines = [
  v.literal("jscodeshift"),
  v.literal("filemod"),
  v.literal("ts-morph"),
  v.literal("ast-grep"),
  v.literal("workflow"),
];
export const knownEnginesSchema = v.union(
  knownEngines,
  "Specified engine is not supported.",
);
export type KnownEngines = InferOutput<typeof knownEnginesSchema>;

const allEngines = [...knownEngines, v.literal("recipe")];
export const allEnginesSchema = v.union(
  allEngines,
  "Specified engine is not supported.",
);
export type AllEngines = InferOutput<typeof allEnginesSchema>;

export const isEngine = (engine: unknown) => v.is(allEnginesSchema, engine);

const configJsonBaseSchema = v.object({
  $schema: v.optional(v.string()),
  name: v.string(`"name" of the codemod has to be a string.`),
  description: v.optional(v.string(`"description" has to be a string.`)),
  version: getSemVerValidationSchema(`"version" has to be a valid semver.`),
  engine: allEnginesSchema,
  // We should have custom logic for this in our code. For orgs, we default to private, for users, we default to public
  // just as npm does.
  private: v.optional(v.boolean(`"private" field has to be a boolean.`)),
  // To overwrite default include patterns
  include: v.optional(
    v.array(
      v.string("Include has to be an array of strings."),
      "Include has to be an array of strings.",
    ),
  ),
  applicability: v.optional(
    v.object({
      // Array of tuples: [libName, versionOperator, version]
      from: v.optional(
        v.array(
          getLibraryVersionTupleValidator(
            `Invalid library version specified in "from" field. It has to be of the following format: [["libname", ">=", "1.0.0"]].`,
          ),
          `"from" has to be an array of tuples of the following format: [["libname", ">=", "1.0.0"]].`,
        ),
      ),
      // Array of tuples: [libName, versionOperator, version]
      to: v.optional(
        v.array(
          getLibraryVersionTupleValidator(
            `Invalid library version specified in "to" field. It has to be of the following format: [["libname", ">=", "1.0.0"]].`,
          ),
          `"to" has to be an array of tuples of the following format: [["libname", ">=", "1.0.0"]].`,
        ),
      ),
    }),
  ),
  deps: v.optional(
    v.array(
      v.custom<string>((val) => {
        if (typeof val !== "string") {
          return false;
        }

        const { libName, version } = extractLibNameAndVersion(val);
        // e.g. -jest
        if (libName?.startsWith("-")) {
          return true;
        }

        // e.g. vitest. This would install the latest version
        if (version === null) {
          return true;
        }

        return semVerValidationFunc(version);
      }, `"deps" has to be an array of valid strings. E.g. libraryToAdd@2.0.0, libraryToAdd or -libraryToRemove`),
      `"deps" has to be an array.`,
    ),
  ),
  arguments: v.optional(argumentsSchema, []),
  meta: v.optional(
    v.object({
      tags: v.optional(
        v.array(
          v.string("Tags has to be an array of strings."),
          `"tags" has to be an array of strings.`,
        ),
      ),
      git: v.optional(v.string("Git link has to be a string.")),
    }),
  ),
  entry: v.optional(v.string("Codemod entry point path has to be a string.")),
});

export const knownEnginesCodemodConfigSchema = v.object({
  ...configJsonBaseSchema.entries,
  ...v.object({
    engine: knownEnginesSchema,
  }).entries,
});

export const recipeCodemodConfigSchema = v.object({
  ...configJsonBaseSchema.entries,
  ...v.object({
    engine: v.literal("recipe"),
    names: v.array(v.string()),
  }).entries,
});

export const codemodConfigSchema = v.union([
  knownEnginesCodemodConfigSchema,
  recipeCodemodConfigSchema,
]);

export const parseCodemodConfig = (config: unknown) =>
  v.parse(codemodConfigSchema, config, { abortEarly: true });

export const safeParseCodemodConfig = (config: unknown) =>
  v.safeParse(codemodConfigSchema, config);

export type CodemodConfig = InferOutput<typeof codemodConfigSchema>;
export type CodemodConfigInput = InferInput<typeof codemodConfigSchema>;

export type RecipeCodemodConfig = InferOutput<typeof recipeCodemodConfigSchema>;
export type RecipeCodemodConfigValidationInput = InferInput<
  typeof recipeCodemodConfigSchema
>;

export type KnownEnginesCodemodConfig = InferOutput<
  typeof knownEnginesCodemodConfigSchema
>;
export type KnownEnginesCodemodConfigValidationInput = InferInput<
  typeof knownEnginesCodemodConfigSchema
>;
