import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useLogStore } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { parseSnippet } from "@studio/utils/babelParser";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import type { RangeCommand } from "@studio/utils/tree";
import jscodeshift from "jscodeshift";

const alphanumerizeString = (input: string): string => {
  let output = "";

  for (const character of input) {
    if (!character.match(/[a-zA-Z0-9]/)) {
      continue;
    }

    output += character;
  }

  return output;
};

const buildPhrasesUsingTokens = (snippet: string): ReadonlyArray<string> => {
  const parseResult = parseSnippet(snippet);

  const tokens =
    parseResult !== null && "tokens" in parseResult
      ? parseResult.tokens ?? []
      : [];

  return tokens
    .map((token) => {
      if (token === null) {
        return null;
      }

      if ("value" in token) {
        const { value } = token;

        if (typeof value === "string") {
          return value;
        }
      }

      if ("type" in token) {
        const { type } = token;

        if (typeof type !== "object" || type === null) {
          return null;
        }

        const { label } = type;

        return typeof label === "string" && label !== "eof" && label !== ";"
          ? label
          : null;
      }

      return null;
    })
    .filter(isNeitherNullNorUndefined);
};

const buildPhrasesUsingIdentifiers = (
  snippet: string,
): ReadonlyArray<string> => {
  const j = jscodeshift.withParser("tsx");
  const root = j(snippet);

  return root
    .find(j.Identifier)
    .paths()
    .filter((path, i, array) => {
      if (i === 0) {
        return true;
      }

      const previousPath = array[i - 1];

      return previousPath?.value.name !== path.value.name;
    })
    .map((path) => alphanumerizeString(path.value.name));
};

const calculateReplacementRanges = (
  output: string | null | undefined,
  replacedSnippets: ReadonlyArray<string>,
): ReadonlyArray<OffsetRange> => {
  if (!output || replacedSnippets.length === 0) {
    return [];
  }
  try {
    const replacementOffsetRanges: OffsetRange[] = [];

    replacedSnippets.forEach((snippet) => {
      let phrases = buildPhrasesUsingTokens(snippet);

      if (phrases.length === 0) {
        phrases = buildPhrasesUsingIdentifiers(snippet);
        if (phrases.length === 0) {
          return;
        }
      }

      const regex = new RegExp(phrases.join(".*?"), "gs");

      for (const regExpMatchArray of output.matchAll(regex)) {
        const start = regExpMatchArray.index ?? 0;
        const end = start + regExpMatchArray[0].length;

        replacementOffsetRanges.push({
          start,
          end,
        });
      }
    });

    return replacementOffsetRanges;
  } catch (error) {
    console.error(error);

    return [];
  }
};

export const useSetActiveEventThunk = () => {
  const { setActiveEventHashDigest, events } = useLogStore();
  const { getSelectedEditors } = useSnippetsStore();
  const {
    setAfterSelection,
    setOutputSelection,
    outputSnippet,
    setBeforeSelection,
  } = getSelectedEditors();
  const { setCodemodSelection } = useModStore();
  return (eventHashDigest: string) => {
    if (eventHashDigest === null) {
      const rangeCommand: RangeCommand = {
        kind: "PASS_THROUGH",
        ranges: [],
      };

      setBeforeSelection(rangeCommand);
      setAfterSelection(rangeCommand);
      setOutputSelection(rangeCommand);

      return;
    }

    const event =
      events.find(({ hashDigest }) => hashDigest === eventHashDigest) ?? null;

    if (event === null) {
      return;
    }

    setActiveEventHashDigest(eventHashDigest);

    setCodemodSelection({
      kind: "PASS_THROUGH",
      ranges: [event.codemodSourceRange],
    });

    setBeforeSelection({
      // the selection from the evens will thus be reflected in the Find & Replace panel
      kind: "FIND_CLOSEST_PARENT",
      ranges: "snippetBeforeRanges" in event ? event.snippetBeforeRanges : [],
    });
    setAfterSelection({
      kind: "PASS_THROUGH",
      ranges: [],
    });

    setOutputSelection({
      kind: "PASS_THROUGH",
      ranges: calculateReplacementRanges(
        outputSnippet ?? "",
        "codes" in event ? event.codes : [],
      ),
    });
  };
};
