import { isFile } from "@babel/types";
import create from "zustand";
import { OffsetRange } from "~/schemata/offsetRangeSchemata";
import { TreeNode } from "~/types/tree";
import { parseSnippet } from "../../utils/babelParser";
import mapBabelASTToRenderableTree from "../../utils/mappers";
import { RangeCommand, buildRanges } from "../../utils/tree";
import { INITIAL_STATE } from "../getInitialState";

type ModStateValues = {
	internalContent: string | null;
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
	const parsed = parseSnippet(INITIAL_STATE.codemodSource);

	const parsedContent = isFile(parsed)
		? mapBabelASTToRenderableTree(parsed)
		: null;

	return {
		internalContent: INITIAL_STATE.codemodSource,
		hasRuntimeErrors: false,
		parsedContent,
		ranges: [],
		rangesUpdatedAt: Date.now(),
		command: INITIAL_STATE.command,
	};
};

export const useModStore = create<ModState>((set, get) => ({
	...getInitialState(),
	setState: (newState) => set((state) => ({ ...state, ...newState })),
	setContent: (content) => {
		const parsed = parseSnippet(content);
		const parsedContent = isFile(parsed)
			? mapBabelASTToRenderableTree(parsed)
			: null;
		set({ internalContent: content, parsedContent });
	},
	setHasRuntimeErrors: (hasError) => set({ hasRuntimeErrors: hasError }),
	setCodemodSelection: (command) => {
		const { parsedContent } = get();
		const ranges = buildRanges(parsedContent, command);
		set({ ranges, rangesUpdatedAt: Date.now() });
	},
	setCurrentCommand: (command) => set({ command }),
}));
