import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useExecuteRangeCommandOnBeforeInput } from "@studio/store/useExecuteRangeCommandOnBeforeInput";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useLogStore } from "@studio/store/zustand/log";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { parseSnippet } from "@studio/utils/babelParser";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import type { RangeCommand } from "@studio/utils/tree";
import jscodeshift from "jscodeshift";

let alphanumerizeString = (input: string): string => {
  let output = "";

  for (let character of input) {
    if (!character.match(/[a-zA-Z0-9]/)) {
      continue;
    }

    output += character;
  }

  return output;
};

let buildPhrasesUsingTokens = (snippet: string): ReadonlyArray<string> => {
  let parseResult = parseSnippet(snippet);
  let executeRangeCommandOnBeforeInputThunk =
    useExecuteRangeCommandOnBeforeInput();

  let tokens =
    parseResult !== null && "tokens" in parseResult
      ? parseResult.tokens ?? []
      : [];

  return tokens
    .map((token) => {
      if (token === null) {
        return null;
      }

      if ("value" in token) {
        let { value } = token;

        if (typeof value === "string") {
          return value;
        }
      }

      if ("type" in token) {
        let { type } = token;

        if (typeof type !== "object" || type === null) {
          return null;
        }

        let { label } = type;

        return typeof label === "string" && label !== "eof" && label !== ";"
          ? label
          : null;
      }

      return null;
    })
    .filter(isNeitherNullNorUndefined);
};

let buildPhrasesUsingIdentifiers = (
  snippet: string,
): ReadonlyArray<string> => {
  let j = jscodeshift.withParser("tsx");
  let root = j(snippet);

  return root
    .find(j.Identifier)
    .paths()
    .filter((path, i, array) => {
      if (i === 0) {
        return true;
      }

      let previousPath = array[i - 1];

      return previousPath?.value.name !== path.value.name;
    })
    .map((path) => alphanumerizeString(path.value.name));
};

let calculateReplacementRanges = (
  output: string | null | undefined,
  replacedSnippets: ReadonlyArray<string>,
): ReadonlyArray<OffsetRange> => {
  if (!output || replacedSnippets.length === 0) {
    return [];
  }
  try {
    let replacementOffsetRanges: OffsetRange[] = [];

    replacedSnippets.forEach((snippet) => {
      let phrases = buildPhrasesUsingTokens(snippet);

      if (phrases.length === 0) {
        phrases = buildPhrasesUsingIdentifiers(snippet);
        if (phrases.length === 0) {
          return;
        }
      }

      let regex = new RegExp(phrases.join(".*?"), "gs");

      for (let regExpMatchArray of output.matchAll(regex)) {
        let start = regExpMatchArray.index ?? 0;
        let end = start + regExpMatchArray[0].length;

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

export let useSetActiveEventThunk = () => {
  let { setActiveEventHashDigest, events } = useLogStore();
  let { setOutputSelection } = useSnippetStore();
  let { setCodemodSelection } = useModStore();
  let { content, setSelections } = useCodemodOutputStore();
  let executeRangeCommandOnBeforeInputThunk =
    useExecuteRangeCommandOnBeforeInput();
  return (eventHashDigest: string) => {
    if (eventHashDigest === null) {
      let rangeCommand: RangeCommand = {
        kind: "PASS_THROUGH",
        ranges: [],
      };

      executeRangeCommandOnBeforeInputThunk(rangeCommand);
      setOutputSelection(rangeCommand);
      setSelections(rangeCommand);

      return;
    }

    let event =
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
