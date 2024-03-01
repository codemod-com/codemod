import { useCallback } from "react";
import {
	_ExplorerNode,
	_ExplorerNodeHashDigest,
} from "../../../src/persistedState/explorerNodeCodec";
import { ExplorerTree } from "../../../src/selectors/selectExplorerTree";
import { NodeDatum } from "../customTreeView";
import { vscode } from "../shared/utilities/vscode";
import TreeItem, { IconName } from "./FileExplorerTreeNode";

const getIconName = (explorerNode: _ExplorerNode): IconName | null => {
	if (explorerNode.kind === "FILE") {
		return explorerNode.fileAdded ? "file-add" : "file";
	}

	return null;
};

const getLabel = (explorerNode: _ExplorerNode, opened: boolean): string => {
	return explorerNode.kind !== "FILE" && !opened
		? `${explorerNode.label} (${explorerNode.childCount})`
		: explorerNode.label;
};

export const explorerNodeRenderer =
	(explorerTree: ExplorerTree) =>
	(props: {
		nodeDatum: NodeDatum<_ExplorerNodeHashDigest, _ExplorerNode>;
		onFlip: (hashDigest: _ExplorerNodeHashDigest) => void;
		onFocus: (hashDigest: _ExplorerNodeHashDigest) => void;
	}) => {
		const iconName = getIconName(props.nodeDatum.node);
		const focused = props.nodeDatum.focused;
		const reviewed = props.nodeDatum.reviewed;

		const { onFocus, onFlip, nodeDatum } = props;

		const explorerNodeHashDigest = props.nodeDatum.node.hashDigest;

		const checkboxState =
			explorerTree.indeterminateExplorerNodeHashDigests.includes(
				explorerNodeHashDigest,
			)
				? "indeterminate"
				: explorerTree.selectedExplorerNodeHashDigests.includes(
							explorerNodeHashDigest,
					  )
				  ? "checked"
				  : "blank";

		const handleClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();

				onFocus(nodeDatum.node.hashDigest);
			},
			[onFocus, nodeDatum.node.hashDigest],
		);

		const handleCheckboxClick = useCallback(
			(event: React.MouseEvent) => {
				event.stopPropagation();

				vscode.postMessage({
					kind: "webview.global.flipSelectedExplorerNode",
					caseHashDigest: explorerTree.caseHash,
					explorerNodeHashDigest,
				});
			},
			[explorerNodeHashDigest, explorerTree.caseHash],
		);

		const handleChevronClick = useCallback(
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
