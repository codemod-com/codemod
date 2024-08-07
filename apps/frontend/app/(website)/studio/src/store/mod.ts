import { isFile } from "@babel/types";
import type { KnownEngines } from "@codemod-com/utilities";
import { isServer } from "@studio/config";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { TreeNode } from "@studio/types/tree";
import { prettify } from "@studio/utils/prettify";
import { create } from "zustand";
import { parseSnippet } from "../utils/babelParser";
import mapBabelASTToRenderableTree from "../utils/mappers";
import { type RangeCommand, buildRanges } from "../utils/tree";
import {
  DEFAULT_FIND_REPLACE_EXPRESSION,
  STARTER_SNIPPET,
  TSMORPH_STARTER_SNIPPET,
} from "./initialState";

type ModStateValues = {
  name: string;
  content: string | null;
  hasRuntimeErrors: boolean;
  parsedContent: TreeNode | null;
  ranges: ReadonlyArray<OffsetRange>;
  rangesUpdatedAt: number;
  command: string | null;
};

type ModStateSetters = {
  setState: (newState: Partial<ModState>) => void;
  setContent: (content: string) => void;
  setHasRuntimeErrors: (hasError: boolean) => void;
  setCodemodSelection: (command: RangeCommand) => void;
  setCurrentCommand: (command: ModState["command"]) => void;
};

export const buildDefaultCodemodSource = (engine: KnownEngines) => {
  if (engine === "jscodeshift") {
    return prettify(
      STARTER_SNIPPET.replace(
        "{%DEFAULT_FIND_REPLACE_EXPRESSION%}",
        DEFAULT_FIND_REPLACE_EXPRESSION,
      ).replace("{%COMMENT%}", ""),
    );
  }

  return TSMORPH_STARTER_SNIPPET;
};

export type ModState = ModStateSetters & ModStateValues;

const getInitialState = (): ModStateValues => {
  let initialContent: string;

  if (isServer) {
    initialContent = buildDefaultCodemodSource("jscodeshift");
  } else {
    const savedContent = localStorage.getItem("mod-store-content");
    initialContent = savedContent || buildDefaultCodemodSource("jscodeshift");
  }

  const parsed = parseSnippet(initialContent);
  const parsedContent = isFile(parsed)
    ? mapBabelASTToRenderableTree(parsed)
    : null;

  return {
    name: "",
    content: initialContent,
    hasRuntimeErrors: false,
    parsedContent,
    ranges: [],
    rangesUpdatedAt: Date.now(),
    command: null,
  };
};

export const useModStore = create<ModState>((set, get) => ({
  ...getInitialState(),
  setState: (newState) => {
    set((state) => {
      const updatedState = { ...state, ...newState };
      if (!isServer) {
        localStorage.setItem("mod-store-content", updatedState.content || "");
      }
      return updatedState;
    });
  },
  setContent: (content) => {
    const parsed = parseSnippet(content);
    const parsedContent = isFile(parsed)
      ? mapBabelASTToRenderableTree(parsed)
      : null;
    set({ content, parsedContent });
    if (!isServer) {
      localStorage.setItem("mod-store-content", content);
    }
  },
  setHasRuntimeErrors: (hasError) => set({ hasRuntimeErrors: hasError }),
  setCodemodSelection: (command) => {
    const { parsedContent } = get();
    const ranges = buildRanges(parsedContent, command);
    set({ ranges, rangesUpdatedAt: Date.now() });
  },
  setCurrentCommand: (command) => set({ command }),
}));
