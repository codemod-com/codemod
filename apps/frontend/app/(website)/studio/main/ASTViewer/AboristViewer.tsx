import { cn } from "@/utils";
import type { Node } from "@babel/types";
import Text from "@studio/components/Text";
import { useScrollNodeIntoView } from "@studio/main/ASTViewer/useScrollNodeIntoView";
import { useSelectFirstTreeNodeForSnippet, useSnippetsStore, } from "@studio/store/snippets";
import { useRangesOnTarget } from "@studio/store/utils/useRangesOnTarget";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { NodeApi, Tree } from "react-arborist";
import useResizeObserver from "use-resize-observer";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import { omit } from "ramda";

// Define types
type TreeNode = {
  id: string;
  actualNode: Node;
  label: string;
  children?: TreeNode[];
  start: number;
  end: number;
};

type EditorType = "before" | "after" | "output";

// Component Props
interface Props {
  type: EditorType;
}

// Utility function to remove empty children from a TreeNode
const removeEmptyChildren = (node: TreeNode): TreeNode => {
  const transformedChildren = node.children?.map(removeEmptyChildren).filter(child => child.children?.length || !child.children) || [];

  return {
    ...node,
    children: transformedChildren.length > 0 ? transformedChildren : undefined,
  };
};

// Function to transform tree data based on node types

const parseNodeData = (node: TreeNode, identifier: string) => (param, index) => ({
  id: `${ node.id }-${identifier}-${ index }`,
  actualNode: param,
  label: param.type,
  start: param.start,
  end: param.end,
})
const getPosition = (node: TreeNode) => `${ node.start }-${ node.end }`
const transformTreeData = (node: TreeNode, relation?: string): TreeNode => {
  const result: TreeNode = {
    ...node,
    relation,
    children: [],
  };

  if (node.actualNode.type === 'CallExpression') {
    const args = node.actualNode.arguments.map(parseNodeData(node, 'arg'));
    const argumentsIds = args.map(getPosition);
    result.children = node.children
      .map(child => {
        const isParam = argumentsIds.includes(getPosition(child));
        return transformTreeData(child, (isParam ? 'argument' : child.label))
      }) || [];
  } else if (node.actualNode.type === 'FunctionDeclaration') {
    const params =  node.actualNode.params.map(parseNodeData(node, 'param'));
    const paramsIds = params.map(getPosition);

    // Transform remaining children
    result.children = node.children
      .map(child => {
        const isParam = paramsIds.includes(getPosition(child));
        const nameMap = {
          BlockStatement: 'body',
          Identifier: 'id'
        }
        return transformTreeData(child, (isParam ? 'param' : nameMap[child.label]) || child.label);
      }) || [];

  } else {
    result.children = node.children?.map(child =>
      transformTreeData(child,
        Array.isArray(node.actualNode[node.label])
          ? node.label
          : Object.keys(node.actualNode).find(key => node.actualNode[key] === child.actualNode)
      )
    ) || [];
  }

  return result;
};

type Node = {
  id?: string;
  actualNode?: any;
  label?: string;
  start?: number;
  end?: number;
  children?: Node[];
  [key: string]: any;
};

function extractComments(node: Node): [Node, Node[]] {
  const comments: Node[] = [];
  const seenComments = new Set<string>();

  function traverse(node: Node, parent: Node | null = null): any {
    if (typeof node !== 'object' || node === null) {
      return node;
    }

    if (node.label === 'CommentLine' || node.label === 'CommentBlock') {
      const commentKey = `${node.start}-${node.end}`;
      if (!seenComments.has(commentKey)) {
        seenComments.add(commentKey);
        comments.push({
          ...node,
          parentId: parent?.id,
          parentStart: parent?.start,
          parentEnd: parent?.end,
        });
      }
      return undefined;
    }

    const result: {[key: string]: any} = {};
    for (const [key, value] of Object.entries(node)) {
      if (key !== 'comments' && key !== 'internalComments') {
        if (Array.isArray(value)) {
          result[key] = value.map(item => traverse(item, node)).filter(item => item !== undefined);
        } else if (typeof value === 'object' && value !== null) {
          const traversed = traverse(value, node);
          if (traversed !== undefined) {
            result[key] = traversed;
          }
        } else {
          result[key] = value;
        }
      }
    }

    return result;
  }

  const cleanedStructure = traverse(node);
  return [cleanedStructure, comments];
}

function insertComments(node: Node, comments: Node[]): Node {
  const commentMap = new Map<string, Node[]>();
  comments.forEach(comment => {
    const key = comment.parentId || 'root';
    if (!commentMap.has(key)) {
      commentMap.set(key, []);
    }
    commentMap.get(key)!.push(comment);
  });

  function traverse(node: any): any {
    if (typeof node !== 'object' || node === null) {
      return node;
    }

    const result: {[key: string]: any} = { ...node };

    const nodeComments = commentMap.get(node.id || 'root') || [];
    if (nodeComments.length > 0) {
      result.comments = nodeComments.map(comment => ({
        type: comment.actualNode.type,
        value: comment.actualNode.value,
        start: comment.start,
        end: comment.end
      }));
    }

    for (const key in result) {
      if (key !== 'comments') {
        if (Array.isArray(result[key])) {
          result[key] = result[key].map(traverse);
        } else if (typeof result[key] === 'object' && result[key] !== null) {
          result[key] = traverse(result[key]);
        }
      }
    }

    return result;
  }

  return traverse(node);
}

function processStructure(node: Node): Node {
  const [cleanedStructure, extractedComments] = extractComments(node);
  return insertComments(cleanedStructure, extractedComments);
}

// Main ASTViewer component
export const ASTViewer: React.FC<Props> = ({ type }) => {
  const ASTTreeRef = useRef<HTMLDivElement>(null);
  const { width = 0, height = 0 } = useResizeObserver({ ref: ASTTreeRef });
  const getFirstTreeNode = useSelectFirstTreeNodeForSnippet();
  const [firstNode, setFirstNode] = useState<TreeNode | null>(null);
  const { getSelectedEditors } = useSnippetsStore();
  const {
    [type]: { rootNode },
  } = getSelectedEditors();

  const setRangesOnTarget = useRangesOnTarget();
  const scrollNodeIntoView = useScrollNodeIntoView(type);

  // Handle node click event
  const handleNodeClick = useCallback(
    (node: NodeApi<TreeNode> = rootNode) => {
      console.log({ node })
      const data = node.data || rootNode;
      scrollNodeIntoView(data, ASTTreeRef);
      setFirstNode(data);
      setRangesOnTarget({
        target: `${ type.toUpperCase() }_INPUT`,
        ranges: [data],
      });
      const setRange = getSelectedEditors().setSelection(type);
      setRange({
        kind: "FIND_CLOSEST_PARENT",
        ranges: [data],
      });
    },
    [rootNode, scrollNodeIntoView, setRangesOnTarget, type, getSelectedEditors],
  );

  // Effect to handle initial rendering and scrolling to first tree node
  useEffect(() => {
    const firstTreeNode = getFirstTreeNode(type);
    if (firstTreeNode) {
      scrollNodeIntoView(firstTreeNode, ASTTreeRef);
      setFirstNode(firstTreeNode);
    }
  }, [scrollNodeIntoView, getFirstTreeNode, type]);

  const NodeComponent = ({ node, style, dragHandle }) => {
    const isSelected = firstNode?.id === node.data.id;
    return (
      <div style={ style } ref={ dragHandle }>
        <Text
          className="cursor-pointer whitespace-nowrap"
          color={ isSelected ? "text-cyan-500" : undefined }
        >
          { !node.isLeaf ? (
            <strong
              onClick={ () => node.toggle() }
              className={ cn(
                node.isOpen ? "text-red-600" : "text-green-500",
              ) }
            >
              { node.isOpen ? "- " : "+ " }
            </strong>
          ) : <span>&nbsp;&nbsp;</span> }
          <span
            onClick={ (e) => {
              e.stopPropagation();
              handleNodeClick(node);
            } }
            className="inline-block"
            id={ node.data.id }
          >
              { node.data.relation && (
                <span className="text-purple-500 mr-1">{ node.data.relation }: </span>
              ) }
            { node.data.label }
            </span>
        </Text>
      </div>
    );
  }

  // Render message if no rootNode is available
  if (!rootNode) {
    return (
      <div className="flex h-full flex-col w-full overflow-hidden p-2">
        <Text>
          Please provide a snippet to render an Abstract Syntax Tree for it.
        </Text>
      </div>
    );
  }

  // const findProgram = (node) => node?.data?.actualNode.type === 'Program' ? node.children[0] : findProgram(node.children[0])
  // Transform and render the AST tree
  const transformedRootNode = transformTreeData(mapBabelASTToRenderableTree(rootNode)) || null;

  const removeDoubledComments = (node) => {
    if(!node) return null
    console.log('in removwe', node.actualNode.label, )
    if (node.actualNode.label === 'File') {
      return  node.children[0].children[0]
    }
    else if (node.actualNode.label === 'Program') {
      return node.children[0]
    }
    return node;
  }

  const withComments = removeEmptyChildren(transformedRootNode);
  const [cleanedStructure, extractedComments] = extractComments(withComments);



  return (
    <div
      className="flex h-full flex-col w-full overflow-hidden p-2"
      ref={ ASTTreeRef }
    >
      <Tree
        data={ cleanedStructure?.children }
        openByDefault={ true }
        width={ width }
        height={ height }
        indent={ 12 }
        rowHeight={ 22 }
      >
        { NodeComponent }
      </Tree>
    </div>
  );
};
