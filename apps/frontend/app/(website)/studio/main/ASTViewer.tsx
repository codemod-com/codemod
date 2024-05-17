import Text from "@studio/components/Text";
import Tree, { type TreeNode } from "@studio/components/Tree";
import useScrollNodeIntoView from "@studio/hooks/useScrollNodeIntoView";
import { useCallback, useEffect, useRef } from "react";

import type { SnippetType } from "@studio/main/PageBottomPane";
import { useExecuteRangeCommandOnBeforeInput } from "@studio/store/useExecuteRangeCommandOnBeforeInput";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import {
  useSelectFirstTreeNode,
  useSelectSnippetsFor,
  useSnippetStore,
} from "@studio/store/zustand/snippets";

type Props = {
  type: "before" | "after" | "output";
};

export let useSnippetRootNode = (type: SnippetType) => {
  let { rootNode } = useCodemodOutputStore();
};
let ASTViewer = ({ type }: Props) => {
  let ASTTreeRef = useRef<HTMLDivElement>(null);
  let executeRangeCommandOnBeforeInputThunk =
    useExecuteRangeCommandOnBeforeInput();
  let { rootNode } = useSelectSnippetsFor(type);
  let getFirstTreeNode = useSelectFirstTreeNode();
  let { setSelections } = useCodemodOutputStore();
  let { setOutputSelection } = useSnippetStore();

  let setRange =
    type === "before"
      ? executeRangeCommandOnBeforeInputThunk
      : type === "after"
        ? setOutputSelection
        : setSelections;

  let scrollNodeIntoView = useScrollNodeIntoView();

  let handleNodeClick = useCallback(
    (node: TreeNode) => {
      setRange({
        kind: "FIND_CLOSEST_PARENT",
        ranges: [node],
      });
      scrollNodeIntoView(node, ASTTreeRef);
    },
    [scrollNodeIntoView, setRange],
  );

  useEffect(() => {
    if (getFirstTreeNode(type) !== null) {
      scrollNodeIntoView(getFirstTreeNode(type), ASTTreeRef);
    }
  }, [scrollNodeIntoView, getFirstTreeNode, type]);

  return (
    <>
      <div
        className="flex h-full flex-col overflow-y-auto p-2"
        ref={ASTTreeRef}
      >
        {rootNode ? (
          <Tree
            initialCollapseState="open"
            node={rootNode}
            onClick={handleNodeClick}
            selectedNode={getFirstTreeNode(type) ?? undefined}
          />
        ) : (
          <Text>
            Please provide a snippet to render an Abstract Syntax Tree for it.
          </Text>
        )}
      </div>
    </>
  );
};

export default ASTViewer;
