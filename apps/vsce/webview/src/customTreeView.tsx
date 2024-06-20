import { useCallback, useRef } from 'react';
import type { CodemodNodeHashDigest } from '../../src/selectors/selectCodemodTree';
import { useKey } from './jobDiffView/hooks/useKey';

let getCodemodActionButtons = (
	hashDigest: CodemodNodeHashDigest,
): [HTMLElement | null, HTMLElement | null, HTMLElement | null] => {
	let configButton = document.getElementById(`${hashDigest}-configButton`);
	let dryRunButton = document.getElementById(`${hashDigest}-dryRunButton`);
	let shareButton = document.getElementById(`${hashDigest}-shareButton`);
	return [configButton, dryRunButton, shareButton];
};

type TreeNode<HD extends string> = Readonly<{
	hashDigest: HD;
	label: string;
}>;

export type NodeDatum<HD extends string, TN extends TreeNode<HD>> = Readonly<{
	node: TN;
	depth: number;
	expanded: boolean;
	focused: boolean;
	collapsable: boolean;
	reviewed: boolean;
}>;

export type TreeViewProps<
	HD extends string,
	TN extends TreeNode<HD>,
	ND extends NodeDatum<HD, TN>,
> = Readonly<{
	focusedNodeHashDigest: HD | null;
	collapsedNodeHashDigests: ReadonlyArray<HD>;
	nodeData: ReadonlyArray<ND>;
	nodeRenderer: (
		props: Readonly<{
			nodeDatum: ND;
			onFlip: (hashDigest: HD) => void;
			onFocus: (hashDigest: HD) => void;
		}>,
	) => JSX.Element;
	onFlip: (hashDigest: HD) => void;
	onFocus: (hashDigest: HD) => void;
}>;

export let CustomTreeView = <
	HD extends string,
	TN extends TreeNode<HD> = TreeNode<HD>,
	ND extends NodeDatum<HD, TN> = NodeDatum<HD, TN>,
>(
	props: TreeViewProps<HD, TN, ND>,
) => {
	let ref = useRef<HTMLDivElement>(null);

	let arrowUpCallback = useCallback(() => {
		if (props.focusedNodeHashDigest === null) {
			return;
		}

		let index = props.nodeData.findIndex(
			(nodeDatum) =>
				nodeDatum.node.hashDigest === props.focusedNodeHashDigest,
		);

		if (index === -1) {
			return;
		}

		let newIndex = index === 0 ? props.nodeData.length - 1 : index - 1;

		let hashDigest = props.nodeData[newIndex]?.node.hashDigest ?? null;

		if (hashDigest === null) {
			return;
		}

		props.onFocus(hashDigest);
	}, [props]);

	let arrowDownCallback = useCallback(() => {
		if (props.focusedNodeHashDigest === null) {
			return;
		}

		let index = props.nodeData.findIndex(
			(nodeDatum) =>
				nodeDatum.node.hashDigest === props.focusedNodeHashDigest,
		);

		if (index === -1) {
			return;
		}

		let newIndex = index === props.nodeData.length - 1 ? 0 : index + 1;

		let hashDigest = props.nodeData[newIndex]?.node.hashDigest ?? null;

		if (hashDigest === null) {
			return;
		}

		props.onFocus(hashDigest);
	}, [props]);

	let arrowLeftCallback = useCallback(() => {
		if (props.focusedNodeHashDigest === null) {
			return;
		}

		// applicable to directories
		if (
			!props.collapsedNodeHashDigests.includes(
				props.focusedNodeHashDigest,
			)
		) {
			props.onFlip(props.focusedNodeHashDigest);
		}

		// applicable to codemods
		let activeElement = document.activeElement;
		if (activeElement === null) {
			return;
		}

		let [configButton, dryRunButton, shareButton] = getCodemodActionButtons(
			props.focusedNodeHashDigest as unknown as CodemodNodeHashDigest,
		);

		if (dryRunButton !== null && activeElement.id === dryRunButton.id) {
			configButton?.focus();
		}
		if (shareButton !== null && activeElement.id === shareButton.id) {
			dryRunButton?.focus();
		}
	}, [props]);

	let arrowRightCallback = useCallback(() => {
		if (props.focusedNodeHashDigest === null) {
			return;
		}

		// applicable to directories
		if (
			props.collapsedNodeHashDigests.includes(props.focusedNodeHashDigest)
		) {
			props.onFlip(props.focusedNodeHashDigest);
		}

		// applicable to codemods
		let activeElement = document.activeElement;
		if (activeElement === null) {
			return;
		}
		let [configButton, dryRunButton, shareButton] = getCodemodActionButtons(
			props.focusedNodeHashDigest as unknown as CodemodNodeHashDigest,
		);

		if (configButton !== null && activeElement.id === configButton.id) {
			dryRunButton?.focus();
		}
		if (dryRunButton !== null && activeElement.id === dryRunButton.id) {
			shareButton?.focus();
		}
	}, [props]);

	let enterCallback = useCallback(() => {
		if (props.focusedNodeHashDigest === null) {
			return;
		}

		let [configButton, dryRunButton, shareButton] = getCodemodActionButtons(
			props.focusedNodeHashDigest as unknown as CodemodNodeHashDigest,
		);

		let focusedActionButtonNode =
			[configButton, dryRunButton, shareButton].find(
				(node) =>
					node !== null && document.activeElement?.id === node.id,
			) ?? null;

		if (focusedActionButtonNode !== null) {
			focusedActionButtonNode.click();
			return;
		}

		dryRunButton?.focus();
	}, [props]);

	useKey(ref.current, 'ArrowUp', arrowUpCallback);
	useKey(ref.current, 'ArrowDown', arrowDownCallback);
	useKey(ref.current, 'ArrowLeft', arrowLeftCallback);
	useKey(ref.current, 'ArrowRight', arrowRightCallback);
	useKey(ref.current, 'Enter', enterCallback);
	useKey(ref.current, 'Space', enterCallback);

	return (
		<div ref={ref}>
			{props.nodeData.map((nodeDatum) =>
				props.nodeRenderer({
					nodeDatum,
					onFlip: props.onFlip,
					onFocus: props.onFocus,
				}),
			)}
		</div>
	);
};
