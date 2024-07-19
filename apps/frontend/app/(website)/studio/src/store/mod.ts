import { isFile } from "@babel/types";
import { isServer } from "@studio/config";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { TreeNode } from "@studio/types/tree";
import { prettify } from "@studio/utils/prettify";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseSnippet } from "../utils/babelParser";
import mapBabelASTToRenderableTree from "../utils/mappers";
import { type RangeCommand, buildRanges } from "../utils/tree";
import {
  DEFAULT_FIND_REPLACE_EXPRESSION,
  STARTER_SNIPPET,
  TSMORPH_STARTER_SNIPPET
} from "./initialState";
import type { KnownEngines } from "@codemod-com/utilities";

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
  const savedState = isServer ? null : localStorage.getItem("mod-store");
  const initialState = savedState ? JSON.parse(savedState).content : buildDefaultCodemodSource("jscodeshift");
  const parsed = parseSnippet(initialState);

  const parsedContent = isFile(parsed)
    ? mapBabelASTToRenderableTree(parsed)
    : null;

  return {
    name: "",
    content: initialState,
    hasRuntimeErrors: false,
    parsedContent,
    ranges: [],
    rangesUpdatedAt: Date.now(),
    command: null,
  };
};

export const useModStore = create<ModState>(
  persist(
    (set, get) => ({
      ...getInitialState(),
      setState: (newState) => set((state) => ({ ...state, ...newState })),
      setContent: (content) => {
        const parsed = parseSnippet(content);
        const parsedContent = isFile(parsed)
          ? mapBabelASTToRenderableTree(parsed)
          : null;
        set({ content: prettify(content), parsedContent });
      },
      setHasRuntimeErrors: (hasError) => set({ hasRuntimeErrors: hasError }),
      setCodemodSelection: (command) => {
        const { parsedContent } = get();
        const ranges = buildRanges(parsedContent, command);
        set({ ranges, rangesUpdatedAt: Date.now() });
      },
      setCurrentCommand: (command) => set({ command }),
    }),
    {
      name: "mod-store",
    },
  ),
);
