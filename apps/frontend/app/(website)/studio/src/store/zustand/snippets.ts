import { isFile } from "@babel/types";
import { INITIAL_STATE } from "@studio/store/getInitialState";
import create from "zustand";

import type { KnownEngines } from "@codemod-com/utilities";
import type { SnippetType } from "@studio/main/PageBottomPane";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import type { TreeNode } from "@studio/types/tree";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import { type RangeCommand, buildRanges } from "@studio/utils/tree";
import { parseSnippet } from "../../utils/babelParser";

export type Token = Readonly<{
  start: number;
  end: number;
  value?: string;
}>;

type SnippetStateValues = {
  engine: KnownEngines;
  inputSnippet: string;
  outputSnippet: string;
  beforeInputRootNode: TreeNode | null;
  afterInputRootNode: TreeNode | null;
  beforeInputRanges: ReadonlyArray<TreeNode | OffsetRange>;
  afterInputRanges: ReadonlyArray<TreeNode | OffsetRange>;
  beforeRangeUpdatedAt: number;
  afterRangeUpdatedAt: number;
  beforeInputTokens: ReadonlyArray<Token>;
  afterInputTokens: ReadonlyArray<Token>;
};

type SnippetStateSetters = {
  setEngine: (engine: KnownEngines) => void;
  setInput: (input: string) => void;
  setOutput: (output: string) => void;
  setInputSelection: (command: RangeCommand) => void;
  setOutputSelection: (command: RangeCommand) => void;
};

export type SnippetState = SnippetStateValues & SnippetStateSetters;
export let getInitialState = (): SnippetStateValues => {
  let { engine, beforeSnippet, afterSnippet } = INITIAL_STATE;

  // before input
  let beforeInputParsed = parseSnippet(beforeSnippet);

  let beforeInputRootNode = isFile(beforeInputParsed)
    ? mapBabelASTToRenderableTree(beforeInputParsed)
    : null;

  let beforeInputTokens = isFile(beforeInputParsed)
    ? Array.isArray(beforeInputParsed.tokens)
      ? // @ts-ignore
        beforeInputParsed.tokens.map(({ start, end, value }) => ({
          start,
          end,
          value: value ?? beforeSnippet.slice(start, end),
        }))
      : []
    : [];

  // after input
  let afterInputParsed = parseSnippet(afterSnippet);

  let afterInputRootNode = isFile(afterInputParsed)
    ? mapBabelASTToRenderableTree(afterInputParsed)
    : null;

  let afterInputTokens = isFile(afterInputParsed)
    ? Array.isArray(afterInputParsed.tokens)
      ? // @ts-ignore
        afterInputParsed.tokens.map(({ start, end, value }) => ({
          start,
          end,
          value: value ?? afterSnippet.slice(start, end),
        }))
      : []
    : [];

  return {
    engine,
    beforeInputRootNode,
    afterInputRootNode,
    outputSnippet: afterSnippet,
    inputSnippet: beforeSnippet,
    beforeInputRanges: [],
    beforeRangeUpdatedAt: Date.now(),
    afterInputRanges: [],
    afterRangeUpdatedAt: Date.now(),
    beforeInputTokens,
    afterInputTokens,
  };
};

export let useSnippetStore = create<SnippetState>((set, get) => ({
  ...getInitialState(),
  setEngine: (engine) => set({ engine }),
  setInput: (input) => {
    let parsed = parseSnippet(input);
    let rootNode = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ inputSnippet: input, beforeInputRootNode: rootNode });
  },
  setOutput: (output) => {
    let parsed = parseSnippet(output);
    let rootNode = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ outputSnippet: output, afterInputRootNode: rootNode });
  },
  setInputSelection: (command) => {
    let rootNode = get().beforeInputRootNode;
    if (rootNode) {
      let ranges = buildRanges(rootNode, command);
      set({ beforeInputRanges: ranges, beforeRangeUpdatedAt: Date.now() });
    }
  },
  setOutputSelection: (command) => {
    let rootNode = get().afterInputRootNode;
    if (rootNode) {
      let ranges = buildRanges(rootNode, command);
      set({ afterInputRanges: ranges, afterRangeUpdatedAt: Date.now() });
    }
  },
}));

export let useSelectFirstTreeNode = () => {
  let state = useSnippetStore();
  let { ranges } = useCodemodOutputStore();

  return (type: SnippetType): TreeNode | null => {
    let firstRange: TreeNode | OffsetRange | undefined;

    switch (type) {
      case "before":
        firstRange = state.beforeInputRanges[0];
        break;
      case "after":
        firstRange = state.afterInputRanges[0];
        break;
      case "output":
        firstRange = ranges[0];
        break;
      default:
        return null;
    }

    return firstRange && "id" in firstRange ? firstRange : null;
  };
};

export let useSelectSnippetsFor = (type: SnippetType) => {
  // @TODO make reusable reducer for the code snippet
  // that will include snippet, rootNode, ranges,

  let {
    inputSnippet,
    outputSnippet,
    beforeInputRootNode,
    afterInputRootNode,
    beforeInputRanges,
    afterInputRanges,
  } = useSnippetStore();

  let { ranges, content, rootNode } = useCodemodOutputStore();

  switch (type) {
    case "before":
      return {
        snippet: inputSnippet,
        rootNode: beforeInputRootNode,
        ranges: beforeInputRanges,
      };
    case "after":
      return {
        snippet: outputSnippet,
        rootNode: afterInputRootNode,
        ranges: afterInputRanges,
      };

    case "output":
      return {
        snippet: content,
        rootNode,
        ranges,
      };

    default:
      return {
        snippet: "",
        rootNode: null,
        ranges: [],
      };
  }
};
