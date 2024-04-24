import jscodeshift from "jscodeshift";
import type { OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useExecuteRangeCommandOnBeforeInput } from "~/store/useExecuteRangeCommandOnBeforeInput";
import { useCodemodOutputStore } from "~/store/zustand/codemodOutput";
import { useLogStore } from "~/store/zustand/log";
import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";
import { parseSnippet } from "~/utils/babelParser";
import { isNeitherNullNorUndefined } from "~/utils/isNeitherNullNorUndefined";
import type { RangeCommand } from "~/utils/tree";

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
  const { setOutputSelection } = useSnippetStore();
  const { setCodemodSelection } = useModStore();
  const { content, setSelections } = useCodemodOutputStore();
  const executeRangeCommandOnBeforeInputThunk =
    useExecuteRangeCommandOnBeforeInput();
  return (eventHashDigest: string) => {
    if (eventHashDigest === null) {
      const rangeCommand: RangeCommand = {
        kind: "PASS_THROUGH",
        ranges: [],
      };

      executeRangeCommandOnBeforeInputThunk(rangeCommand);
      setOutputSelection(rangeCommand);
      setSelections(rangeCommand);

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

    executeRangeCommandOnBeforeInputThunk({
      // the selection from the evens will thus be reflected in the Find & Replace panel
      kind: "FIND_CLOSEST_PARENT",
      ranges: "snippetBeforeRanges" in event ? event.snippetBeforeRanges : [],
    });
    setOutputSelection({
      kind: "PASS_THROUGH",
      ranges: [],
    });

    setSelections({
      kind: "PASS_THROUGH",
      ranges: calculateReplacementRanges(
        content ?? "",
        "codes" in event ? event.codes : [],
      ),
    });
  };
};
