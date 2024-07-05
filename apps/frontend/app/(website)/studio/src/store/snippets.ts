import { isFile } from "@babel/types";
import type { KnownEngines } from "@codemod-com/utilities";
import { isServer } from "@studio/config";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { INITIAL_STATE } from "@studio/store/getInitialState";
import { getSnippetInitialState } from "@studio/store/utils/getSnippetInitialState";
import type { TreeNode } from "@studio/types/tree";
import { parseSnippet } from "@studio/utils/babelParser";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import { prettify } from "@studio/utils/prettify";
import { type RangeCommand, buildRanges } from "@studio/utils/tree";
import { map, mapObjIndexed, reduce, remove } from "ramda";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Token = Readonly<{
  start: number;
  end: number;
  value?: string;
}>;

export type SnippetValues = {
  content: string;
  rootNode: TreeNode | null;
  ranges: ReadonlyArray<TreeNode | OffsetRange>;
  tokens: ReadonlyArray<Token>;
  rangeUpdatedAt: number;
};
type SnippetSetters = {
  setContent: (input: string) => void;
  setSelection: (command: RangeCommand) => void;
};

type SnippetValuesMap = {
  [K in EditorType as `${K}Snippet`]: SnippetValues["content"];
};

type SnippetSettersMap = {
  [K in EditorType as `set${Capitalize<K>}Snippet`]: SnippetSetters["setContent"];
} & {
  [K in EditorType as `set${Capitalize<K>}Selection`]: SnippetSetters["setSelection"];
};
type SnippetsConfig = {
  addPair: () => void;
  clearAll: () => void;
  removePair: (index: number) => void;
  selectedPairIndex: number;
  engine: KnownEngines;
  getSelectedEditors: () => Editors &
    SnippetValuesMap &
    SnippetSettersMap & {
      setSelection: (x: EditorType) => (command: RangeCommand) => void;
      setRanges: (x: EditorType) => (command: RangeCommand) => void;
      setContent: (x: EditorType) => (command: RangeCommand) => void;
      renameEditor: (index: number) => (name: string) => void;
    };
  setEngine: (engine: KnownEngines) => void;
  setSelectedPairIndex: (index: number) => void;
};

export type Editors = {
  name: string;
  before: SnippetValues;
  after: SnippetValues;
  output: SnippetValues;
};

export type EditorsSnippets = {
  [x in Omit<keyof Editors, "output">]: string;
};

const toEditorSnippets = (editors: Editors): EditorsSnippets => ({
  name: editors.name,
  before: editors.before.content,
  after: editors.after.content,
});

type AllEditors = {
  [x in keyof Editors]: SnippetValues[];
};
type EditorType = keyof Editors;
type AllSnippets = {
  before: string[];
  after: string[];
  output: string[];
};
type SnippetsValues = {
  editors: Editors[];
  getAllSnippets: () => AllSnippets;
  getAllNames: () => string[];
};
type SnippetsState = SnippetsValues & SnippetsSetters & SnippetsConfig;

type SnippetsSetters = {
  [x in keyof SnippetSetters]: (
    editorsPairIndex: number,
    type: EditorType,
  ) => SnippetSetters[x];
};

const getEditorsFromLS = () => {
  if (isServer) return;
  const editors = localStorage.getItem("editors");
  if (!editors) return;
  return;
};
export const useSnippetsStore = create<SnippetsState>(
  persist(
    (set, get) => ({
      editors: INITIAL_STATE.editors,
      addPair: () => {
        set({
          editors: [
            ...get().editors,
            {
              name: `Test ${
                get()
                  .getAllNames()
                  .filter((name) => name.startsWith("Test "))
                  .map((name) => name.split(" ")[1])
                  .map(Number)
                  .filter(Boolean)
                  .at(-1) + 1
              }`,
              before: getSnippetInitialState(),
              after: getSnippetInitialState(),
              output: getSnippetInitialState(),
            },
          ],
        });
        setTimeout(
          () =>
            set({
              selectedPairIndex: get().editors.length - 1,
            }),
          100,
        );
      },
      renameEditor: (index) => (name) => {
        const obj = get();
        obj.editors[index].name = name;
        set(obj);
      },
      removePair: (index: number) => {
        const editors =
          get().editors.length > 1
            ? remove(index, 1, get().editors)
            : get().editors;
        if (index === get().selectedPairIndex) {
          set({
            selectedPairIndex: 0,
            editors,
          });
        } else
          set({
            selectedPairIndex: Math.max(get().selectedPairIndex - 1, 0),
            editors,
          });
      },
      clearAll: () => {
        set({
          selectedPairIndex: 0,
        });
        setTimeout(
          () =>
            set({
              editors: [
                {
                  name: "Test 1",
                  before: getSnippetInitialState(),
                  after: getSnippetInitialState(),
                  output: getSnippetInitialState(),
                },
              ],
            }),
          100,
        );
      },
      engine: INITIAL_STATE.engine,
      selectedPairIndex: 0,
      getAllNames: () => get().editors.map(({ name }) => name),
      getAllSnippets: () => {
        return mapObjIndexed(
          map(({ content }: SnippetValues) => content),
          reduce(
            (acc, { before, after, output }) => ({
              before: [...acc.before, before],
              after: [...acc.after, after],
              output: [...acc.output, output],
            }),
            {
              before: [],
              after: [],
              output: [],
            } as AllEditors,
            get().editors,
          ),
        );
      },
      setSelectedPairIndex: (i: number) => {
        set({ selectedPairIndex: i });
      },
      getSelectedEditors: () => {
        const index = get().selectedPairIndex || 0;
        const editors = get().editors?.[index] as Editors;
        return {
          ...editors,
          setContent: (type) => get().setContent(index, type),
          beforeSnippet: editors?.before?.content || "",
          afterSnippet: editors?.after?.content || "",
          outputSnippet: editors?.output?.content || "",
          setBeforeSnippet: get().setContent(index, "before"),
          setAfterSnippet: get().setContent(index, "after"),
          setOutputSnippet: get().setContent(index, "output"),
          setBeforeSelection: get().setSelection(index, "before"),
          setAfterSelection: get().setSelection(index, "after"),
          setOutputSelection: get().setSelection(index, "output"),
          setSelection: (editorType: EditorType) =>
            get().setSelection(index, editorType),
        };
      },
      setEngine: (engine) =>
        set({
          engine,
        }),
      setContent: (editorsPairIndex, type) => {
        return (content) => {
          const parsed = parseSnippet(content);
          const rootNode = isFile(parsed)
            ? mapBabelASTToRenderableTree(parsed)
            : null;

          const obj = get();
          obj.editors[editorsPairIndex][type].content = prettify(content);
          obj.editors[editorsPairIndex][type].rootNode = rootNode;
          set(obj);
          try {
            localStorage.setItem(
              "editors",
              JSON.stringify(obj.editors.map(toEditorSnippets)),
            );
          } catch (error) {
            console.error("error on JSON.stringify(obj.editors) ", { error });
          }
        };
      },
      setSelection: (editorsPairIndex, type) => (command) => {
        const rootNode = get().editors[editorsPairIndex]?.[type]?.rootNode;
        if (rootNode) {
          const ranges = buildRanges(rootNode, command);

          const obj = get();
          obj.editors[editorsPairIndex][type].ranges = ranges;
          obj.editors[editorsPairIndex][type].rangeUpdatedAt = Date.now();
          set(obj);
        }
      },
    }),
    {
      name: "snippets-storage",
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        engine: persistedState.engine || INITIAL_STATE.engine,
        editors: persistedState.editors || INITIAL_STATE.editors,
      }),
    },
  ),
);

export const useSelectFirstTreeNodeForSnippet = () => {
  const { getSelectedEditors } = useSnippetsStore();

  return (type: EditorType) => {
    const firstRange = getSelectedEditors()[type].ranges[0];
    return firstRange && "id" in firstRange ? firstRange : null;
  };
};
