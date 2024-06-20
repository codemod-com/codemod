import type { KnownEngines } from "@codemod-com/utilities";
import type { TreeNode } from "@studio/types/tree";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import { buildRanges, RangeCommand } from "@studio/utils/tree";
import { parseSnippet } from "@studio/utils/babelParser";
import { isFile } from "@babel/types";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import { create } from "zustand";
import { assocPath, is, mergeDeepRight, mergeDeepWithKey, path, pathSatisfies, zipWith } from "ramda";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { AFTER_SNIPPET_DEFAULT_CODE, BEFORE_SNIPPET_DEFAULT_CODE } from "@studio/store/getInitialState";

const customMerge = (k, l, r) => {
	if (is(Array, l) && is(Array, r)) {
		// If both are arrays, merge them element-wise
		return zipWith(mergeDeepWithKey(customMerge), l, r);
	}
	// Otherwise, default to right-hand value
	return r;
};

// Deep merge function
const deepMergeWithArrays = mergeDeepWithKey(customMerge);

export type Token = Readonly<{
	start: number;
	end: number;
	value?: string;
}>;


type SnippetValues = {
	content: string;
	rootNode: TreeNode | null;
	ranges: ReadonlyArray<TreeNode | OffsetRange>;
	tokens: ReadonlyArray<Token>;
	rangeUpdatedAt: number;
}
type SnippetSetters = {
	setContent: (input: string) => void;
	setSelection: (command: RangeCommand) => void;
}

type SnippetValuesMap = {
	[K in EditorType as `${ K }Snippet`]: SnippetValues['content'];
};

type SnippetSettersMap = {
	[K in EditorType as `set${ Capitalize<K> }Snippet`]: SnippetSetters['setContent'];
};
type SnippetsConfig = {
	clearAll: () => void;
	selectedPairIndex: number;
	engine: KnownEngines;
	getSelectedEditors: () => Editors & SnippetValuesMap & SnippetSettersMap & {
		setSelection: (x: EditorType) => (command: RangeCommand) => void;
		setRanges: (x: EditorType) => (command: RangeCommand) => void;
	};
	setEngine: (engine: KnownEngines) => void;
	setSelectedPairIndex: (index: number) => void
}

type Editors = { before: SnippetValues, after: SnippetValues, output: SnippetValues };
type EditorType = keyof Editors;
type SnippetsValues = { editors: Editors[] }
type SnippetsState = SnippetsValues & SnippetsSetters & SnippetsConfig


type SnippetsSetters = {
	[x in keyof SnippetSetters]: (editorsPairIndex: number, type: EditorType) => SnippetSetters[x]
}
const getSnippetInitialState = (defaultContent = ''): SnippetValues => {

	const content = defaultContent;
	const contentParsed = parseSnippet(content);

	const rootNode = isFile(contentParsed)
		? mapBabelASTToRenderableTree(contentParsed)
		: null;

	const tokens: SnippetValues['tokens'] = isFile(contentParsed)
		? Array.isArray(contentParsed.tokens)
			? // @ts-ignore
			contentParsed.tokens.map(({ start, end, value }) => ({
				start,
				end,
				value: value ?? ''.slice(start, end),
			}))
			: []
		: [];

	return {
		rootNode,
		ranges: [],
		content,
		tokens,
		rangeUpdatedAt: Date.now(),
	};
};


export const useSnippetActions = (set: (state: Partial<SnippetValues>) => (SnippetValues | Partial<SnippetValues>), get: () => SnippetValues): SnippetSetters => ({
	setContent: (content) => {
		const parsed = parseSnippet(content);
		const rootNode = isFile(parsed)
			? mapBabelASTToRenderableTree(parsed)
			: null;
		set({ content, rootNode: rootNode });
	},
	setSelection: (command) => {
		const rootNode = get().rootNode;
		if (rootNode) {
			const ranges = buildRanges(rootNode, command);
			set({ ranges: ranges, rangeUpdatedAt: Date.now() });
		}
	},
})

export const useSnippetsStore = create<SnippetsState>((set, get) => ({
	clearAll: () => set({
		editors: [{
			before: getSnippetInitialState(),
			after: getSnippetInitialState(),
			output: getSnippetInitialState()
		}]
	}),
	engine: "jscodeshift",
	selectedPairIndex: 0,
	setSelectedPairIndex: (i: number) => set({ selectedPairIndex: i }),
	getSelectedEditors: () => {
		const index = get().selectedPairIndex || 0;
		const editors = get().editors?.[index] as Editors
		return {
			...editors,
			beforeSnippet: editors.before.content,
			afterSnippet: editors.after.content,
			outputSnippet: editors.output.content,
			setBeforeSnippet: get().setContent(index, 'before'),
			setAfterSnippet: get().setContent(index, 'after'),
			setOutputSnippet: get().setContent(index, 'output'),
			setSelection: (editorType: EditorType) => get().setSelection(index, editorType),
		}
	},
	editors: [{
		before: getSnippetInitialState(BEFORE_SNIPPET_DEFAULT_CODE),
		after: getSnippetInitialState(AFTER_SNIPPET_DEFAULT_CODE),
		output: getSnippetInitialState()
	}],
	setEngine: (engine) => set({
		engine
	}),
	setContent: (editorsPairIndex, type) => {
		return (content) => {
			const parsed = parseSnippet(content);
			const rootNode = isFile(parsed)
				? mapBabelASTToRenderableTree(parsed)
				: null;

			const rpath = ['editors', editorsPairIndex, type];

			const obj = get();
			if (pathSatisfies(is(Object), rpath, obj)) {
				set(assocPath(rpath, {
					...path(rpath, obj),
					content,
					rootNode
				}, obj));
			}
			else set(obj)
		};
	},
	setSelection: (editorsPairIndex, type) => (command) => {
		const rootNode = get().editors[editorsPairIndex]?.[type]?.rootNode;
		if (rootNode) {
			const ranges = buildRanges(rootNode, command);
			set(mergeDeepRight({
				editors: {
					[editorsPairIndex]: {
						[type]: {
							ranges,
							rangeUpdatedAt: Date.now()
						}
					}
				}
			}, get()))
		}
	},
}))


export const useSelectFirstTreeNodeForSnippet = (editorsPairIndex: number) => {
	const state = useSnippetsStore();
	const { ranges } = useCodemodOutputStore();
	let firstRange: TreeNode | OffsetRange | undefined;

	return (type: EditorType) => {
		if (type === "output") firstRange = ranges[0];
		else firstRange = state.editors[editorsPairIndex]?.[type].ranges[0];

		return firstRange && "id" in firstRange ? firstRange : null;
	}
};


export const useSelectSnippets = (editorsPairIndex: number, type: EditorType) => {
	// @TODO make reusable reducer for the code snippet
	// that will include snippet, rootNode, ranges,

	const empty = {
		snippet: "",
		rootNode: null,
		ranges: [],
	};

	const {
		editors
	} = useSnippetsStore();


	const { ranges, content: outputSnippet, rootNode } = useCodemodOutputStore();

	if (!editors[editorsPairIndex]) return empty;
	const {
		before: {
			content: beforeSnippet,
			rootNode: beforeInputRootNode,
			ranges: beforeInputRanges
		},

		after: {
			content: afterSnippet,
			rootNode: afterInputRootNode,
			ranges: afterInputRanges
		},
	} = editors[editorsPairIndex] as Editors

	switch (type) {
		case "before":
			return {
				snippet: beforeSnippet,
				rootNode: beforeInputRootNode,
				ranges: beforeInputRanges,
			};
		case "after":
			return {
				snippet: afterSnippet,
				rootNode: afterInputRootNode,
				ranges: afterInputRanges,
			};

		case "output":
			return {
				snippet: outputSnippet,
				rootNode,
				ranges,
			};

		default:
			return empty;
	}
};
