/* eslint-disable no-nested-ternary */
/* eslint-disable import/group-exports */
/* eslint-disable no-param-reassign */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Token } from '~/pageComponents/main/CFS/SelectionShowCase';
import { type OffsetRange } from '~/schemata/offsetRangeSchemata';
import { INITIAL_STATE } from '~/store/getInitialState';
import { type TreeNode } from '~/types/tree';
import mapBabelASTToRenderableTree from '~/utils/mappers';
import { buildRanges, type RangeCommand } from '~/utils/tree';
import { isParsedResultFile, parseSnippet } from '../../utils/babelParser';
import type { RootState } from '../index';
import { selectCodemodOutput } from './codemodOutput';

const SLICE_KEY = 'snippets';

const DEFAULT_SNIPPET_NAME = 'Main';

type IndividualSnippetState = {
	// Both the name and the identifier
	name: string;

	// beforeInput - input code
	inputSnippet: string;
	beforeInputRanges: ReadonlyArray<TreeNode | OffsetRange>;
	beforeRangeUpdatedAt: number;
	beforeInputRootNode: TreeNode | null;
	beforeInputTokens: ReadonlyArray<Token>;

	// codemod result
	outputSnippet: string;

	// afterInput - expected
	afterInputRanges: ReadonlyArray<TreeNode | OffsetRange>;
	afterRangeUpdatedAt: number;
	afterInputRootNode: TreeNode | null;
	afterInputTokens: ReadonlyArray<Token>;
};

type SnippetState = Readonly<{
	engine: 'jscodeshift' | 'tsmorph';

	snippets: IndividualSnippetState[];
}>;

type SetSnippetAction = PayloadAction<{
	name: string;
	snippetContent: string;
}>;

type SetRangeAction = PayloadAction<{
	name: string;
	range: RangeCommand;
}>;

type Engine = SnippetState['engine'];

const generateInitialSnippetState = ({
	beforeSnippet,
	afterSnippet,
}: {
	beforeSnippet: string;
	afterSnippet: string;
}) => {
	// before input
	const beforeInputParsed = parseSnippet(beforeSnippet);

	const beforeInputRootNode = isParsedResultFile(beforeInputParsed)
		? mapBabelASTToRenderableTree(beforeInputParsed)
		: null;

	const beforeInputTokens = isParsedResultFile(beforeInputParsed)
		? Array.isArray(beforeInputParsed.tokens)
			? (beforeInputParsed.tokens as any[]).map(
					({ start, end, value }) => ({
						start,
						end,
						value: value ?? beforeSnippet.slice(start, end),
					}),
			  )
			: []
		: [];

	// after input
	const afterInputParsed = parseSnippet(afterSnippet);

	const afterInputRootNode = isParsedResultFile(afterInputParsed)
		? mapBabelASTToRenderableTree(afterInputParsed)
		: null;

	const afterInputTokens = isParsedResultFile(afterInputParsed)
		? Array.isArray(afterInputParsed.tokens)
			? (afterInputParsed.tokens as any[]).map(
					({ start, end, value }) => ({
						start,
						end,
						value: value ?? afterSnippet.slice(start, end),
					}),
			  )
			: []
		: [];

	return {
		beforeInputRootNode,
		afterInputRootNode,
		beforeInputTokens,
		afterInputTokens,
	};
};

const getInitialState = (): SnippetState => {
	const { engine, beforeSnippet, afterSnippet } = INITIAL_STATE;

	const {
		beforeInputRootNode,
		afterInputRootNode,
		beforeInputTokens,
		afterInputTokens,
	} = generateInitialSnippetState({
		beforeSnippet,
		afterSnippet,
	});

	return {
		engine,
		snippets: [
			{
				name: DEFAULT_SNIPPET_NAME,
				beforeInputRootNode,
				afterInputRootNode,
				inputSnippet: beforeSnippet,
				outputSnippet: afterSnippet,
				beforeInputRanges: [],
				beforeRangeUpdatedAt: Date.now(),
				afterInputRanges: [],
				afterRangeUpdatedAt: Date.now(),
				beforeInputTokens,
				afterInputTokens,
			},
		],
	};
};

const snippetsSlice = createSlice({
	name: 'snippets',
	initialState: getInitialState(),
	reducers: {
		addSnippet(
			state,
			action: PayloadAction<{
				name?: string;
			}>,
		) {
			let { name } = action.payload;

			if (!name) {
				const untitledNameRegex = /Untitled\s?(\((\d+)\))?/;

				const untitledNumber = state.snippets.reduce(
					(currentNumber, { name }) => {
						const matches = name.match(untitledNameRegex);
						const untitledNumber = matches?.[2]
							? Number(matches[2])
							: 0;

						if (untitledNumber > currentNumber) {
							return untitledNumber;
						}

						return currentNumber;
					},
					0,
				);

				name =
					untitledNumber === 0
						? 'Untitled'
						: `Untitled (${untitledNumber + 1})`;
			}

			const beforeSnippet = '';
			const afterSnippet = '';

			const {
				beforeInputRootNode,
				afterInputRootNode,
				beforeInputTokens,
				afterInputTokens,
			} = generateInitialSnippetState({
				beforeSnippet,
				afterSnippet,
			});

			const newSnippet = {
				name,
				inputSnippet: beforeSnippet,
				outputSnippet: afterSnippet,
				beforeInputRanges: [],
				beforeRangeUpdatedAt: Date.now(),
				afterInputRanges: [],
				afterRangeUpdatedAt: Date.now(),
				beforeInputRootNode,
				afterInputRootNode,
				beforeInputTokens,
				afterInputTokens,
			};

			state.snippets.push(newSnippet);
		},
		setEngine(state, action: PayloadAction<SnippetState['engine']>) {
			state.engine = action.payload;
		},
		setInput(state, action: SetSnippetAction) {
			const beforeInputParsed = parseSnippet(
				action.payload.snippetContent,
			);

			const currentSnippet = state.snippets.find(
				({ name }) => name === action.payload.name,
			);
			if (!currentSnippet) {
				return;
			}

			currentSnippet.inputSnippet = action.payload.snippetContent;
			// state.beforeInputRanges = [];
			currentSnippet.beforeInputRootNode = isParsedResultFile(
				beforeInputParsed,
			)
				? mapBabelASTToRenderableTree(beforeInputParsed)
				: null;
		},
		setOutput(state, action: SetSnippetAction) {
			const afterInputParsed = parseSnippet(
				action.payload.snippetContent,
			);

			const currentSnippet = state.snippets.find(
				({ name }) => name === action.payload.name,
			);
			if (!currentSnippet) {
				return;
			}

			currentSnippet.outputSnippet = action.payload.snippetContent;
			// state.afterInputRanges = [];
			currentSnippet.afterInputRootNode = isParsedResultFile(
				afterInputParsed,
			)
				? mapBabelASTToRenderableTree(afterInputParsed)
				: null;
		},
		setInputSelection(state, action: SetRangeAction) {
			const currentSnippet = state.snippets.find(
				({ name }) => name === action.payload.name,
			);
			if (!currentSnippet) {
				return;
			}
			// @ts-expect-error immutability
			currentSnippet.beforeInputRanges = buildRanges(
				currentSnippet.beforeInputRootNode,
				action.payload.range,
			);
			currentSnippet.beforeRangeUpdatedAt = Date.now();
		},
		setOutputSelection(state, action: SetRangeAction) {
			const currentSnippet = state.snippets.find(
				({ name }) => name === action.payload.name,
			);
			if (!currentSnippet) {
				return;
			}
			// @ts-expect-error immutability
			currentSnippet.afterInputRanges = buildRanges(
				currentSnippet.afterInputRootNode,
				action.payload.range,
			);
			currentSnippet.afterRangeUpdatedAt = Date.now();
		},
	},
});

const {
	addSnippet,
	setEngine,
	setInput,
	setOutput,
	setInputSelection,
	setOutputSelection,
} = snippetsSlice.actions;

const selectSnippets = (state: RootState) => state[SLICE_KEY];

const selectEngine = (state: RootState) => selectSnippets(state).engine;

const selectIndividualSnippet =
	(name: string) =>
	(state: RootState): IndividualSnippetState | undefined =>
		selectSnippets(state).snippets.find(
			({ name: candidateName }) => candidateName === name,
		);

const selectSnippetNames = (state: RootState) =>
	selectSnippets(state).snippets.map(({ name }) => name);

const selectSnippetsFor =
	(type: 'before' | 'after' | 'output', name: string) =>
	(state: RootState) => {
		// @TODO make reusable reducer for the code snippet
		// that will include snippet, rootNode, ranges,

		const currentSnippet = selectIndividualSnippet(name)(state);

		if (!currentSnippet) {
			console.warn('Snippet not found', name);
			return {
				snippet: '',
				rootNode: null,
				ranges: [],
			};
		}

		const {
			inputSnippet,
			outputSnippet,
			beforeInputRootNode,
			afterInputRootNode,
			beforeInputRanges,
			afterInputRanges,
		} = currentSnippet;

		const { ranges, content, rootNode } = selectCodemodOutput(state);

		switch (type) {
			case 'before':
				return {
					snippet: inputSnippet,
					rootNode: beforeInputRootNode,
					ranges: beforeInputRanges,
				};
			case 'after':
				return {
					snippet: outputSnippet,
					rootNode: afterInputRootNode,
					ranges: afterInputRanges,
				};

			case 'output':
				return {
					snippet: content,
					rootNode,
					ranges,
				};

			default:
				return {
					snippet: '',
					rootNode: null,
					ranges: [],
				};
		}
	};

export const selectFirstTreeNode =
	(type: 'before' | 'after' | 'output', name: string) =>
	(state: RootState): TreeNode | null => {
		const currentSnippet = selectIndividualSnippet(name)(state);

		if (!currentSnippet) {
			return null;
		}

		const { beforeInputRanges, afterInputRanges } = currentSnippet;
		const { ranges } = selectCodemodOutput(state);

		const [firstRange] =
			type === 'before'
				? beforeInputRanges
				: type === 'after'
				  ? afterInputRanges
				  : ranges;

		return firstRange && 'id' in firstRange ? firstRange : null;
	};

export {
	addSnippet,
	setEngine,
	setInput,
	setOutput,
	selectEngine,
	selectSnippets,
	selectSnippetsFor,
	setInputSelection,
	setOutputSelection,
	selectSnippetNames,
	selectIndividualSnippet,
	SLICE_KEY,
	DEFAULT_SNIPPET_NAME,
};

export type { Engine };

export default snippetsSlice.reducer;
