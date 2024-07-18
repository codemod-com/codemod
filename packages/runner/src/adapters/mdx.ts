import { fromMarkdown } from "mdast-util-from-markdown";
import { mdxFromMarkdown, mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown } from "mdast-util-to-markdown";
import { mdxjs } from "micromark-extension-mdxjs";
import type { Root } from "node_modules/mdast-util-from-markdown/lib/index.js";
import type { Node } from "node_modules/unist-util-filter/lib/index.js";
import { CONTINUE, SKIP, visit } from "unist-util-visit";

type TransformFunction = (
  codemodSource: string,
  oldPath: string,
  oldData: string,
  ...rest: unknown[]
) => string;

const parseMdx = (data: string) =>
  fromMarkdown(data, {
    extensions: [mdxjs()],
    mdastExtensions: [mdxFromMarkdown()],
  });

const stringifyMdx = (tree: Root) =>
  toMarkdown(tree, { extensions: [mdxToMarkdown()] });

const getNodeOffsetRange = (node: Node) => {
  const { position } = node;

  if (position === undefined) {
    return null;
  }

  const {
    start: { offset: startOffset },
    end: { offset: endOffset },
  } = position;

  if (startOffset === undefined || endOffset === undefined) {
    return null;
  }

  return {
    start: startOffset,
    end: endOffset,
  };
};

const JSX_NODE_TYPES = ["mdxjsEsm", "mdxJsxFlowElement"];

export const mdxAdapter =
  (transform: TransformFunction): TransformFunction =>
  (codemodSource, oldPath, oldData, api, options, callback) => {
    const tree = parseMdx(oldData);

    visit(tree, (node) => {
      if (!JSX_NODE_TYPES.includes(node.type)) {
        return CONTINUE;
      }

      const offsetRange = getNodeOffsetRange(node);

      if (offsetRange === null) {
        return CONTINUE;
      }

      const { start, end } = offsetRange;

      const mdxjsEsmValue = oldData.slice(start, end);

      const transformedMdxjsEsmValue = transform(
        codemodSource,
        oldPath,
        mdxjsEsmValue,
        api,
        options,
        callback,
      );

      if (typeof transformedMdxjsEsmValue !== "string") {
        return SKIP;
      }

      const root = parseMdx(transformedMdxjsEsmValue);

      const newNode = root.children[0];

      if (newNode === undefined) {
        return SKIP;
      }

      Object.assign(node, newNode);

      return SKIP;
    });

    return stringifyMdx(tree);
  };
