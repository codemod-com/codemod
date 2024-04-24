import type {
  CodemodNode,
  CodemodNodeHashDigest,
  CodemodTree,
  NodeDatum,
} from "../../../../src/selectors/selectCodemodTree";
import { CustomTreeView } from "../../customTreeView";
import { vscode } from "../../shared/utilities/vscode";
import { getCodemodNodeRenderer } from "../CodemodNodeRenderer";
import { useProgressBar } from "../useProgressBar";

type Props = Readonly<{
  tree: CodemodTree;
  screenWidth: number | null;
  autocompleteItems: ReadonlyArray<string>;
  rootPath: string | null;
}>;

const onFocus = (hashDigest: CodemodNodeHashDigest) => {
  vscode.postMessage({
    kind: "webview.global.selectCodemodNodeHashDigest",
    selectedCodemodNodeHashDigest: hashDigest,
  });
};

const onFlip = (hashDigest: CodemodNodeHashDigest) => {
  vscode.postMessage({
    kind: "webview.global.flipCodemodHashDigest",
    codemodNodeHashDigest: hashDigest,
  });

  onFocus(hashDigest);
};

const TreeView = ({
  tree,
  autocompleteItems,
  rootPath,
  screenWidth,
}: Props) => {
  const progress = useProgressBar();

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
