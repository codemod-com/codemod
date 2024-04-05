import { isFile } from "@babel/types";
import create from "zustand";
import { INITIAL_STATE } from "~/zustand/utils/getInitialState";

import { SnippetType } from "~/pageComponents/main/PageBottomPane";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { JSEngine } from "~/types/Engine";
import { type TreeNode } from "~/types/tree";
import mapBabelASTToRenderableTree from "~/utils/mappers";
import { type RangeCommand, buildRanges } from "~/utils/tree";
import { useCodemodOutputStore } from "~/zustand/stores/codemodOutput";
import { parseSnippet } from "../../utils/babelParser";

export type Token = Readonly<{
	start: number;
	end: number;
	value?: string;
}>;

type SnippetStateValues = {
	engine: JSEngine;
	beforeSnippetText: string;
	afterSnippetText: string;
	beforeSnippetRootNode: TreeNode | null;
	afterSnippetRootNode: TreeNode | null;
	beforeSnippetSelectionRanges: ReadonlyArray<TreeNode | OffsetRange>;
	afterSnippetSelectionRanges: ReadonlyArray<TreeNode | OffsetRange>;
	beforeRangeUpdatedAt: number;
	afterRangeUpdatedAt: number;
	beforeInputTokens: ReadonlyArray<Token>;
	afterInputTokens: ReadonlyArray<Token>;
};

type SnippetStateSetters = {
	setEngine: (engine: JSEngine) => void;
	setBeforeSnippetText: (input: string) => void;
	setAfterSnippetText: (output: string) => void;
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
		beforeSnippetRootNode: beforeInputRootNode,
		afterSnippetRootNode: afterInputRootNode,
		afterSnippetText: afterSnippet,
		beforeSnippetText: beforeSnippet,
		beforeSnippetSelectionRanges: [],
		beforeRangeUpdatedAt: Date.now(),
		afterSnippetSelectionRanges: [],
		afterRangeUpdatedAt: Date.now(),
		beforeInputTokens,
		afterInputTokens,
	};
};

export const useSnippetStore = create<SnippetState>((set, get) => ({
	...getInitialState(),
	setEngine: (engine) => set({ engine }),
	setBeforeSnippetText: (input) => {
		const parsed = parseSnippet(input);
		const rootNode = isFile(parsed)
			? mapBabelASTToRenderableTree(parsed)
			: null;
		set({ beforeSnippetText: input, beforeSnippetRootNode: rootNode });
	},
	setAfterSnippetText: (output) => {
		const parsed = parseSnippet(output);
		const rootNode = isFile(parsed)
			? mapBabelASTToRenderableTree(parsed)
			: null;
		set({ afterSnippetText: output, afterSnippetRootNode: rootNode });
	},
	setInputSelection: (command) => {
		const rootNode = get().beforeSnippetRootNode;
		if (rootNode) {
			const ranges = buildRanges(rootNode, command);
			set({
				beforeSnippetSelectionRanges: ranges,
				beforeRangeUpdatedAt: Date.now(),
			});
		}
	},
	setOutputSelection: (command) => {
		const rootNode = get().afterSnippetRootNode;
		if (rootNode) {
			const ranges = buildRanges(rootNode, command);
			set({
				afterSnippetSelectionRanges: ranges,
				afterRangeUpdatedAt: Date.now(),
			});
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
				firstRange = state.beforeSnippetSelectionRanges[0];
				break;
			case "after":
				firstRange = state.afterSnippetSelectionRanges[0];
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
		beforeSnippetText,
		afterSnippetText,
		beforeSnippetRootNode,
		afterSnippetRootNode,
		beforeSnippetSelectionRanges,
		afterSnippetSelectionRanges,
	} = useSnippetStore();

	const { ranges, content, rootNode } = useCodemodOutputStore();

	switch (type) {
		case "before":
			return {
				snippet: beforeSnippetText,
				rootNode: beforeSnippetRootNode,
				ranges: beforeSnippetSelectionRanges,
			};
		case "after":
			return {
				snippet: afterSnippetText,
				rootNode: afterSnippetRootNode,
				ranges: afterSnippetSelectionRanges,
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
