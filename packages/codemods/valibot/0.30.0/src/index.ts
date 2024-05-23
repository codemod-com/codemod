import type { Api } from "@codemod.com/workflow";

const SCHEMAS = [
  "any",
  "array",
  "bigint",
  "blob",
  "boolean",
  "custom",
  "date",
  "enum_",
  "instance",
  "intersect",
  "lazy",
  "literal",
  "looseObject",
  "looseTuple",
  "map",
  "nan",
  "never",
  "nonNullable",
  "nonNullish",
  "nonOptional",
  "null_",
  "nullable",
  "nullish",
  "number",
  "object",
  "objectWithRest",
  "optional",
  "picklist",
  "record",
  "set",
  "strictObject",
  "strictTuple",
  "string",
  "symbol",
  "tuple",
  "tupleWithRest",
  "undefined_",
  "union",
  "unknown",
  "variant",
  "void_",
];

const ACTIONS = [
  "bic",
  "brand",
  "bytes",
  "check",
  "creditCard",
  "cuid2",
  "decimal",
  "email",
  "emoji",
  "empty",
  "endsWith",
  "every",
  "excludes",
  "finite",
  "hash",
  "hexadecimal",
  "hexColor",
  "imei",
  "includes",
  "integer",
  "ip",
  "ipv4",
  "ipv6",
  "isoDate",
  "isoDateTime",
  "isoTime",
  "isoTimeSecond",
  "isoTimestamp",
  "isoWeek",
  "length",
  "mac",
  "mac48",
  "mac64",
  "maxBytes",
  "maxLength",
  "maxSize",
  "maxValue",
  "mimeType",
  "minBytes",
  "minLength",
  "minSize",
  "minValue",
  "multipleOf",
  "nonEmpty",
  "notBytes",
  "notLength",
  "notSize",
  "notValue",
  "octal",
  "readonly",
  "regex",
  "safeInteger",
  "size",
  "some",
  "startsWith",
  "toLowerCase",
  "toMaxValue",
  "toMinValue",
  "toUpperCase",
  "transform",
  "trim",
  "trimEnd",
  "trimStart",
  "ulid",
  "url",
  "uuid",
  "value",
];

const RENAMES: [string, string][] = [
  ["custom", "check"],
  ["BaseSchema", "GenericSchema"],
  ["Input", "InferInput"],
  ["Output", "InferOutput"],
  ["special", "custom"],
  ["toCustom", "transform"],
  ["toTrimmed", "trim"],
  ["toTrimmedEnd", "trimEnd"],
  ["toTrimmedStart", "trimStart"],
];

const constructIsImported =
  ({
    importStar,
    namedImports,
  }: { importStar?: string; namedImports: string[] }) =>
  (name?: string) => {
    if (importStar && name && name.startsWith(`${importStar}.`)) {
      return true;
    }

    return !!(name && namedImports.includes(name));
  };

const constructIs = ({
  importStar,
  namedImports,
  keys,
}: {
  importStar?: string;
  namedImports: string[];
  keys: string[];
}) => {
  const isImported = constructIsImported({ importStar, namedImports });
  return (name?: string) => {
    if (
      name &&
      isImported(name) &&
      keys.includes(name.replace(new RegExp(`^${importStar}.`), ""))
    )
      return true;

    return !!(name && keys.includes(name) && isImported(name));
  };
};

export async function workflow({ jsFiles }: Api) {
  await jsFiles("**/*.{js,jsx,ts,tsx,cjs,mjs}", async ({ astGrep }) => {
    const importStar = (
      await astGrep`import * as $IMPORT from "valibot"`.map(({ getMatch }) =>
        getMatch("IMPORT")?.text(),
      )
    ).shift();

    const namedImports = (
      await astGrep`import { $$$IMPORTS } from "valibot"`.map(
        ({ getMultipleMatches }) =>
          getMultipleMatches("IMPORTS")
            .filter((node) => node.kind() === "import_specifier")
            .map((node) => node.text()),
      )
    ).reduce((allImports, imports) => {
      allImports.push(...imports);
      return allImports;
    }, [] as string[]);

    const isSchema = constructIs({ importStar, namedImports, keys: SCHEMAS });
    const isAction = constructIs({ importStar, namedImports, keys: ACTIONS });
    const isImported = constructIsImported({ importStar, namedImports });

    // v.pipe support
    const pipeFixes = (
      await astGrep`$SCHEMA($$$REST, [$$$ACTIONS])`.map(
        ({ getMatch, getMultipleMatches, getNode }) => {
          const schema = getMatch("SCHEMA")?.text();
          const rest = getMultipleMatches("REST").map((node) => node.text());
          const actions = getMultipleMatches("ACTIONS").filter(
            (node) => node.kind() !== ",",
          );
          const pipeMethod = importStar ? "v.pipe" : "pipe";

          if (
            isSchema(schema) &&
            actions.every((node) => {
              return (
                node.kind() === "call_expression" &&
                isAction(node.child(0)?.text())
              );
            })
          ) {
            const replacement = `${pipeMethod}(${schema}(${rest.join(
              " ",
            )}), ${actions.map((node) => node.text())})`;

            return { replace: getNode().text(), with: replacement };
          }
        },
      )
    ).filter((replacement) => !!replacement) as {
      replace: string;
      with: string;
    }[];

    // simple renames
    const renames = [] as { replace: string; with: string }[];
    for (const [from, to] of [
      ...(importStar
        ? RENAMES.map(([f, t]) => [`${importStar}.${f}`, `${importStar}.${t}`])
        : []),
      ...RENAMES,
    ]) {
      if (!isImported(from)) continue;
      renames.push({ replace: from, with: to });
    }

    const isObject = constructIs({
      importStar,
      namedImports,
      keys: ["object"],
    });
    const isTuple = constructIs({
      importStar,
      namedImports,
      keys: ["tuple"],
    });
    const isUnknown = constructIs({
      importStar,
      namedImports,
      keys: ["unknown"],
    });
    const isNever = constructIs({
      importStar,
      namedImports,
      keys: ["never"],
    });
    const isMerge = constructIs({
      importStar,
      namedImports,
      keys: ["merge"],
    });
    const isBrand = constructIs({
      importStar,
      namedImports,
      keys: ["brand"],
    });
    const isTransform = constructIs({
      importStar,
      namedImports,
      keys: ["transform"],
    });

    // object/tuple fixes
    const objectOrTupleFixes = (
      await astGrep`$OBJECT($ARGUMENT, $SCHEMA)`.map(
        ({ getMatch, getNode }) => {
          const object = getMatch("OBJECT")?.text();
          const argument = getMatch("ARGUMENT")?.text();
          const schema = getMatch("SCHEMA");

          if (
            (isObject(object) || isTuple(object)) &&
            schema?.kind() === "call_expression" &&
            isSchema(schema.child(0)?.text()) &&
            !(
              isUnknown(schema.child(0)?.text()) ||
              isNever(schema.child(0)?.text())
            )
          ) {
            return {
              replace: getNode().text(),
              with: `${object}WithRest(${argument}, ${schema.text()})`,
            };
          }
        },
      )
    ).filter((replacement) => !!replacement) as {
      replace: string;
      with: string;
    }[];

    // loose and strict object/tuple fixes
    const looseOrStrictFixes = (
      await astGrep`$OBJECT($ARGUMENT, $SCHEMA)`.map(
        ({ getMatch, getNode }) => {
          const object = getMatch("OBJECT")?.text();
          const argument = getMatch("ARGUMENT")?.text();
          const schema = getMatch("SCHEMA");

          let objectOrTuple: string | undefined;
          let looseOrStrict: string | undefined;

          if (isObject(object)) objectOrTuple = "Object";
          if (isTuple(object)) objectOrTuple = "Tuple";
          if (isUnknown(schema?.child(0)?.text())) looseOrStrict = "loose";
          if (isNever(schema?.child(0)?.text())) looseOrStrict = "strict";

          if (objectOrTuple && looseOrStrict) {
            return {
              replace: getNode().text(),
              with: `${
                importStar ? `${importStar}.` : ""
              }${looseOrStrict}${objectOrTuple}(${argument})`,
            };
          }
        },
      )
    ).filter((replacement) => !!replacement) as {
      replace: string;
      with: string;
    }[];

    // object merging
    const objectMerging = (
      await astGrep`$MERGE([$$$OBJECTS])`.map(
        ({ getMultipleMatches, getNode, getMatch }) => {
          const merge = getMatch("MERGE")?.text();
          const objects = getMultipleMatches("OBJECTS").map((node) => {
            if (node.kind() === ",") {
              return node.text();
            }

            return `...${node.text()}.entries`;
          });

          if (isMerge(merge)) {
            return {
              replace: getNode().text(),
              with: `${
                importStar ? `${importStar}.` : ""
              }object({${objects.join(" ")}})`,
            };
          }
        },
      )
    ).filter((replacement) => !!replacement) as {
      replace: string;
      with: string;
    }[];

    // brand and transform fixes
    const brandOrTransform = (
      await astGrep`$BRAND($SCHEMA, $ARGUMENT)`.map(({ getMatch, getNode }) => {
        const brand = getMatch("BRAND")?.text();
        const schema = getMatch("SCHEMA")?.text();
        const argument = getMatch("ARGUMENT")?.text();

        if (isBrand(brand) || isTransform(brand)) {
          return {
            replace: getNode().text(),
            with: `${
              importStar ? `${importStar}.` : ""
            }pipe(${schema}, ${brand}(${argument}))`,
          };
        }
      })
    ).filter((replacement) => !!replacement) as {
      replace: string;
      with: string;
    }[];

    console.log({
      pipeFixes,
      renames,
      objectOrTupleFixes,
      looseOrStrictFixes,
      objectMerging,
      brandOrTransform,
    });
  });
}
