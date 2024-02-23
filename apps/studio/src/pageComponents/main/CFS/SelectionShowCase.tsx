/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
import { isTSTypeAnnotation, type Node } from '@babel/types';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveSnippet } from '~/store/slices/view';
// @TODO return to this component later
import {
	nodeHasValues,
	selectNodesByState,
	states,
	transitionNodeState,
} from '../../../store/slices/CFS';
import {
	selectFirstTreeNode,
	selectIndividualSnippet,
} from '../../../store/slices/snippets';
import { type TreeNode } from '../../../types/tree';
import { findClosestParentWithinRange } from '../../../utils/tree';

const CodeSnippet = dynamic(() => import('~/components/Snippet'), {
	loading: () => <p>Loading...</p>,
	ssr: false,
});

export type Token = Readonly<{
	start: number;
	end: number;
	value?: string;
}>;

function tokensToSource(tokens: Token[]): string {
	let source = '';
	let prevEnd = -1;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i]!;

		if (prevEnd !== -1 && prevEnd !== token.start) {
			source += ' ';
		}
		source += token.value ?? '';
		prevEnd = token.end;
	}

	return source;
}

// @TODO find a better way to do this...
function getTokenAtPosition(tokens: Token[], position: number): Token | null {
	let result = 0;
	let prevEnd = -1;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i]!;
		if (prevEnd !== -1 && prevEnd !== token.start) {
			result += 1;
		}

		const value = token.value ?? '';
		result += value.length;
		if (result >= position) {
			return token;
		}

		prevEnd = token.end;
	}

	return null;
}

const getTokensOutsideOfRange = (tokens: Token[], start: number, end: number) =>
	tokens.filter((token) => !(token.start >= start && token.end <= end));

const getTokensWithinRange = (
	tokens: ReadonlyArray<Token>,
	start: number,
	end: number,
) => tokens.filter((token) => token.start >= start && token.end <= end);

const buildTokenForUnselectedNode = (node: Node): Token => ({
	start: node.start ?? 0,
	end: node.end ?? 0,
	value: isTSTypeAnnotation(node) ? '' : '...',
});

const buildTokenForTypeNode = (start: number, end: number, index: number) => ({
	start,
	end,
	value: `$${String.fromCharCode(65 + index)}`,
});

const getFilteredTokens = (
	tokens: Token[],
	unselectedNodes: TreeNode[],
	typeNodes: TreeNode[],
) => {
	let result: Token[] = [...tokens];
	// eslint-disable-next-line no-debugger
	unselectedNodes.forEach((node) => {
		const filteredTokens = getTokensOutsideOfRange(
			result,
			node.start,
			node.end,
		);

		if (filteredTokens.length !== result.length) {
			filteredTokens.push(buildTokenForUnselectedNode(node.actualNode));
		}

		result = filteredTokens;
	});

	let index = 0;
	typeNodes.forEach((node) => {
		if (!nodeHasValues(node.actualNode.type)) {
			return;
		}

		const filteredTokens = getTokensOutsideOfRange(
			result,
			node.start,
			node.end,
		);

		if (filteredTokens.length !== result.length) {
			filteredTokens.push(
				buildTokenForTypeNode(node.start, node.end, index),
			);
			result = filteredTokens;
			index++;
		}
	});

	return result.sort((a, b) => a.start - b.start);
};

const SelectionShowCase = () => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const currentSnippet = useSelector(selectIndividualSnippet(activeSnippet));
	const selectedNode = useSelector(
		selectFirstTreeNode('before', activeSnippet),
	);
	const unselectedNodes = useSelector(
		selectNodesByState(selectedNode, states.UNSELECTED),
	);
	const typeNodes = useSelector(
		selectNodesByState(selectedNode, states.TYPE),
	);
	const dispatch = useDispatch();

	const tokensInSelectedNode = useMemo(() => {
		if (selectedNode === null || !currentSnippet) {
			return [];
		}

		return getTokensWithinRange(
			currentSnippet.beforeInputTokens,
			selectedNode.start,
			selectedNode.end,
		);
	}, [selectedNode, currentSnippet]);

	const filteredTokens = getFilteredTokens(
		tokensInSelectedNode,
		unselectedNodes,
		typeNodes,
	);

	const sourceString = tokensToSource(filteredTokens);

	const handleClick = (position: number) => {
		if (!selectedNode) {
			return;
		}

		const token = getTokenAtPosition(filteredTokens, position);

		if (!token) {
			return;
		}

		const node = findClosestParentWithinRange(
			selectedNode,
			token.start,
			token.end,
		);

		if (!node) {
			return;
		}

		dispatch(transitionNodeState({ selectedNode, node }));
	};

	const hightForSnippet = useMemo(() => {
		const { length } = sourceString.split('\n');
		return length > 0 && length < 6 ? length * 20 : 90;
	}, [sourceString]);

	return (
		<CodeSnippet
			height={`${hightForSnippet}px`}
			highlights={[]}
			onClick={handleClick}
			path="showcase.ts"
			value={sourceString}
		/>
	);
};

export default SelectionShowCase;
