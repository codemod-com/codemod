import { isFile } from "@babel/types";
import { isServer } from "@studio/config";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { TreeNode } from "@studio/types/tree";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { parseSnippet } from "../utils/babelParser";
import mapBabelASTToRenderableTree from "../utils/mappers";
import { type RangeCommand, buildRanges } from "../utils/tree";
import { INITIAL_STATE } from "./getInitialState";

type ModStateValues = {
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

export type ModState = ModStateSetters & ModStateValues;
const getInitialState = (): ModStateValues => {
  const savedState = isServer ? null : localStorage.getItem("mod-store");
  const hasSavedState = savedState && JSON.parse(savedState).content;
  const parsed = parseSnippet(hasSavedState || INITIAL_STATE.codemodSource);

  const parsedContent = isFile(parsed)
    ? mapBabelASTToRenderableTree(parsed)
    : null;

  return {
    content: INITIAL_STATE.codemodSource,
    hasRuntimeErrors: false,
    parsedContent,
    ranges: [],
    rangesUpdatedAt: Date.now(),
    command: INITIAL_STATE.command,
  };
};

export const useModStore = create<ModState>(
  persist(
    (set, get) => ({
      setState: (newState) => set((state) => ({ ...state, ...newState })),
      setContent: (content) => {
        const parsed = parseSnippet(content);
        const parsedContent = isFile(parsed)
          ? mapBabelASTToRenderableTree(parsed)
          : null;
        set({ content, parsedContent });
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
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        ...(!persistedState && getInitialState()),
      }),
    },
  ),
);
