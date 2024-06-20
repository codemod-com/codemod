import type {
	CodemodNode,
	CodemodNodeHashDigest,
	CodemodTree,
	NodeDatum,
} from '../../../../src/selectors/selectCodemodTree';
import { CustomTreeView } from '../../customTreeView';
import { vscode } from '../../shared/utilities/vscode';
import { getCodemodNodeRenderer } from '../CodemodNodeRenderer';
import { useProgressBar } from '../useProgressBar';

type Props = Readonly<{
	tree: CodemodTree;
	screenWidth: number | null;
	autocompleteItems: ReadonlyArray<string>;
	rootPath: string | null;
}>;

let onFocus = (hashDigest: CodemodNodeHashDigest) => {
	vscode.postMessage({
		kind: 'webview.global.selectCodemodNodeHashDigest',
		selectedCodemodNodeHashDigest: hashDigest,
	});
};

let onFlip = (hashDigest: CodemodNodeHashDigest) => {
	vscode.postMessage({
		kind: 'webview.global.flipCodemodHashDigest',
		codemodNodeHashDigest: hashDigest,
	});

	onFocus(hashDigest);
};

let TreeView = ({ tree, autocompleteItems, rootPath, screenWidth }: Props) => {
	let progress = useProgressBar();

	return (
		<CustomTreeView<CodemodNodeHashDigest, CodemodNode, NodeDatum>
			{...tree}
			nodeRenderer={getCodemodNodeRenderer({
				progress,
				screenWidth,
				autocompleteItems,
				rootPath,
			})}
			onFlip={onFlip}
			onFocus={onFocus}
		/>
	);
};

export default TreeView;
