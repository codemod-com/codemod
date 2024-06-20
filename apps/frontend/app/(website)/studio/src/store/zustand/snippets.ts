import type { KnownEngines } from "@codemod-com/utilities";
import type { SnippetType } from "@studio/main/PageBottomPane";
import type { OffsetRange } from "@studio/schemata/offsetRangeSchemata";
import type { TreeNode } from "@studio/types/tree";
import { type RangeCommand } from "@studio/utils/tree";
import { useSelectFirstTreeNodeForSnippet, useSelectSnippets, useSnippetsStore } from "@studio/store/zustand/snippets2";

export type Token = Readonly<{
	start: number;
	end: number;
	value?: string;
}>;

type SnippetStateValues = {
	engine: KnownEngines;
	inputSnippet: string;
	afterSnippet: string;
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

export const useSnippetStore = () => {
	const {
		setEngine, setContent, setSelection, editors, engine
	} = useSnippetsStore();

	return {
		get engine() {
			return engine
		},
		get beforeInputRootNode() {
			return editors[0]?.before.rootNode
		},
		get afterInputRootNode() {
			return editors[0]?.after.rootNode
		},
		get afterSnippet() {
			return editors[0]?.after.content
		},
		get afterSnippet() {
			console.log({ 'editors[0]?.before.content': editors[0]?.before.content })
			return editors[0]?.before.content
		},
		get beforeInputRanges() {
			return editors[0]?.before.ranges
		},
		get beforeRangeUpdatedAt() {
			return editors[0]?.before.rangeUpdatedAt
		},
		get afterInputRanges() {
			return editors[0]?.after.ranges
		},
		get afterRangeUpdatedAt() {
			return editors[0]?.after.rangeUpdatedAt
		},
		get beforeInputTokens() {
			return editors[0]?.before.tokens
		},
		get afterInputTokens() {
			return editors[0]?.after.tokens
		},

		setEngine,
		setInput: setContent(0, "before"),
		setOutput: setContent(0, "after"),
		setInputSelection: setSelection(0, "before"),
		setOutputSelection: setSelection(0, "after"),
	}
}


export const useSelectFirstTreeNode = () => useSelectFirstTreeNodeForSnippet(0)

export const useSelectSnippetsFor = (type: SnippetType) => useSelectSnippets(0, type)
