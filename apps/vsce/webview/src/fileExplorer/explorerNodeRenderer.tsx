import { useCallback } from 'react';
import type {
	_ExplorerNode,
	_ExplorerNodeHashDigest,
} from '../../../src/persistedState/explorerNodeCodec';
import type { ExplorerTree } from '../../../src/selectors/selectExplorerTree';
import type { NodeDatum } from '../customTreeView';
import { vscode } from '../shared/utilities/vscode';
import TreeItem, { type IconName } from './FileExplorerTreeNode';

let getIconName = (explorerNode: _ExplorerNode): IconName | null => {
	if (explorerNode.kind === 'FILE') {
		return explorerNode.fileAdded ? 'file-add' : 'file';
	}

	return null;
};

let getLabel = (explorerNode: _ExplorerNode, opened: boolean): string => {
	return explorerNode.kind !== 'FILE' && !opened
		? `${explorerNode.label} (${explorerNode.childCount})`
		: explorerNode.label;
};

export let explorerNodeRenderer =
	(explorerTree: ExplorerTree) =>
	(props: {
		nodeDatum: NodeDatum<_ExplorerNodeHashDigest, _ExplorerNode>;
		onFlip: (hashDigest: _ExplorerNodeHashDigest) => void;
		onFocus: (hashDigest: _ExplorerNodeHashDigest) => void;
	}) => {
		let iconName = getIconName(props.nodeDatum.node);
		let focused = props.nodeDatum.focused;
		let reviewed = props.nodeDatum.reviewed;

		let { onFocus, onFlip, nodeDatum } = props;

		let explorerNodeHashDigest = props.nodeDatum.node.hashDigest;

		let checkboxState =
			explorerTree.indeterminateExplorerNodeHashDigests.includes(
				explorerNodeHashDigest,
			)
				? 'indeterminate'
				: explorerTree.selectedExplorerNodeHashDigests.includes(
							explorerNodeHashDigest,
					  )
					? 'checked'
					: 'blank';

		let handleClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();

				onFocus(nodeDatum.node.hashDigest);
			},
			[onFocus, nodeDatum.node.hashDigest],
		);

		let handleCheckboxClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();

				vscode.postMessage({
					kind: 'webview.global.flipSelectedExplorerNode',
					caseHashDigest: explorerTree.caseHash,
					explorerNodeHashDigest,
				});
			},
			[explorerNodeHashDigest, explorerTree.caseHash],
		);

		let handleChevronClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();

				onFlip(nodeDatum.node.hashDigest);
			},
			[onFlip, nodeDatum.node.hashDigest],
		);

		return (
			<TreeItem
				key={props.nodeDatum.node.hashDigest}
				hasChildren={props.nodeDatum.collapsable}
				id={props.nodeDatum.node.hashDigest}
				label={getLabel(props.nodeDatum.node, props.nodeDatum.expanded)}
				iconName={iconName}
				indent={props.nodeDatum.depth * 18}
				depth={props.nodeDatum.depth}
				open={props.nodeDatum.expanded}
				focused={focused}
				reviewed={reviewed}
				checkboxState={checkboxState}
				kind={props.nodeDatum.node.kind}
				onClick={handleClick}
				onCheckboxClick={handleCheckboxClick}
				onPressChevron={handleChevronClick}
				searchPhrase={explorerTree.searchPhrase}
			/>
		);
	};
