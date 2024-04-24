import { isFile } from "@babel/types";
import create from "zustand";
import { INITIAL_STATE } from "~/store/getInitialState";

import type { KnownEngines } from "@codemod-com/utilities";
import type { SnippetType } from "~/pageComponents/main/PageBottomPane";
import type { OffsetRange } from "~/schemata/offsetRangeSchemata";
import { useCodemodOutputStore } from "~/store/zustand/codemodOutput";
import type { TreeNode } from "~/types/tree";
import mapBabelASTToRenderableTree from "~/utils/mappers";
import { type RangeCommand, buildRanges } from "~/utils/tree";
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
export const getInitialState = (): SnippetStateValues => {
  const { engine, beforeSnippet, afterSnippet } = INITIAL_STATE;

  // before input
  const beforeInputParsed = parseSnippet(beforeSnippet);

  const beforeInputRootNode = isFile(beforeInputParsed)
    ? mapBabelASTToRenderableTree(beforeInputParsed)
    : null;

  const beforeInputTokens = isFile(beforeInputParsed)
    ? Array.isArray(beforeInputParsed.tokens)
      ? (beforeInputParsed.tokens as any[]).map(({ start, end, value }) => ({
          start,
          end,
          value: value ?? beforeSnippet.slice(start, end),
        }))
      : []
    : [];

  // after input
  const afterInputParsed = parseSnippet(afterSnippet);

  const afterInputRootNode = isFile(afterInputParsed)
    ? mapBabelASTToRenderableTree(afterInputParsed)
    : null;

  const afterInputTokens = isFile(afterInputParsed)
    ? Array.isArray(afterInputParsed.tokens)
      ? (afterInputParsed.tokens as any[]).map(({ start, end, value }) => ({
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

export const useSnippetStore = create<SnippetState>((set, get) => ({
  ...getInitialState(),
  setEngine: (engine) => set({ engine }),
  setInput: (input) => {
    const parsed = parseSnippet(input);
    const rootNode = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ inputSnippet: input, beforeInputRootNode: rootNode });
  },
  setOutput: (output) => {
    const parsed = parseSnippet(output);
    const rootNode = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ outputSnippet: output, afterInputRootNode: rootNode });
  },
  setInputSelection: (command) => {
    const rootNode = get().beforeInputRootNode;
    if (rootNode) {
      const ranges = buildRanges(rootNode, command);
      set({ beforeInputRanges: ranges, beforeRangeUpdatedAt: Date.now() });
    }
  },
  setOutputSelection: (command) => {
    const rootNode = get().afterInputRootNode;
    if (rootNode) {
      const ranges = buildRanges(rootNode, command);
      set({ afterInputRanges: ranges, afterRangeUpdatedAt: Date.now() });
    }
  },
}));

export const useSelectFirstTreeNode = () => {
  const state = useSnippetStore();
  const { ranges } = useCodemodOutputStore();

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

export const useSelectSnippetsFor = (type: SnippetType) => {
  // @TODO make reusable reducer for the code snippet
  // that will include snippet, rootNode, ranges,

  const {
    inputSnippet,
    outputSnippet,
    beforeInputRootNode,
    afterInputRootNode,
    beforeInputRanges,
    afterInputRanges,
  } = useSnippetStore();

  const { ranges, content, rootNode } = useCodemodOutputStore();

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
