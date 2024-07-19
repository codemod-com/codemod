import type { KnownEngines } from "@codemod-com/utilities";
import { isServer } from "@studio/config";
import { transformNode } from "@studio/main/ASTViewer/utils";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import {
  getSingleTestCase,
  getSnippetInitialState,
} from "@studio/store/utils/getSnippetInitialState";
import type { TreeNode } from "@studio/types/tree";
import { type RangeCommand, buildRanges } from "@studio/utils/tree";
import { map, mapObjIndexed, omit, reduce, remove } from "ramda";
import { create } from "zustand";

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
  getHasReachedTabsLimit: () => boolean;
  tabsLimit: number;
  currentContent: string;
  currentType: EditorType;
  addPair: (name?: string) => void;
  clearAll: () => void;
  setInitialState: (state: Partial<SnippetsState>) => void;
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
export type EditorType = keyof Editors;
export type AllSnippets = {
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
export const useSnippetsStore = create<SnippetsState>((set, get) => ({
  tabsLimit: 12,
  getHasReachedTabsLimit: () => get().editors.length >= get().tabsLimit,
  // editors: localStorage.getItem('editors') ? JSON.parse(localStorage.getItem('editors')) : [getSingleTestCase()],
  addPair: (name?: string) => {
    set({
      editors: [
        ...get().editors,
        {
          name:
            name ||
            `Test ${
              (get()
                .getAllNames()
                .filter((name) => name.toLowerCase().startsWith("test "))
                .map((name) => name.split(" ")[1])
                .map(Number)
                .filter(Boolean)
                .at(-1) || 0) + 1
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
  editors: [],
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
  setInitialState: (state) => {
    set(state);
  },
  setEngine: (engine) => {
    localStorage.setItem("engine", engine);
    set({
      engine,
    });
  },
  setContent: (editorsPairIndex, type) => {
    return (content) => {
      const obj = get();
      obj.editors[editorsPairIndex][type].content = content;
      obj.editors[editorsPairIndex][type].rootNode = transformNode(
        content,
        type,
      );
      set({ currentContent: content, currentType: type, ...obj });
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
  setEditors: (editorsContents: EditorsSnippets[]) => {
    editorsContents.forEach((eC, i) => {
      get().addPair(eC.name);
      Object.entries(omit(["name"], eC)).forEach(
        ([propName, editorContent]) => {
          get().setContent(i, propName)(editorContent);
          get().setSelection(i, propName)({ kind: "PASS_THROUGH", ranges: [] });
        },
      );
    });
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
}));

if (isServer) {
  useSnippetsStore?.getState?.().setEditors([getSingleTestCase()]);

  useSnippetsStore?.getState?.().setEngine("jscodeshift");
} else {
  useSnippetsStore
    ?.getState?.()
    .setEditors(
      localStorage.getItem("editors")
        ? JSON.parse(localStorage.getItem("editors"))
        : [getSingleTestCase()],
    );
  useSnippetsStore
    ?.getState?.()
    .setEngine(
      (localStorage.getItem("engine") as KnownEngines) || "jscodeshift",
    );
}
