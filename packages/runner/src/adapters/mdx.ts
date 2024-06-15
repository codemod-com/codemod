import { fromMarkdown } from 'mdast-util-from-markdown';
import type { Root } from 'mdast-util-from-markdown/lib';
import { mdxFromMarkdown, mdxToMarkdown } from 'mdast-util-mdx';
import { toMarkdown } from 'mdast-util-to-markdown';
import { mdxjs } from 'micromark-extension-mdxjs';
import type { Node } from 'unist-util-filter/lib';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

type TransformFunction = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	...rest: unknown[]
) => string;

let parseMdx = (data: string) =>
	fromMarkdown(data, {
		extensions: [mdxjs()],
		mdastExtensions: [mdxFromMarkdown()],
	});

let stringifyMdx = (tree: Root) =>
	toMarkdown(tree, { extensions: [mdxToMarkdown()] });

let getNodeOffsetRange = (node: Node) => {
	let { position } = node;

	if (position === undefined) {
		return null;
	}

	let {
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

let JSX_NODE_TYPES = ['mdxjsEsm', 'mdxJsxFlowElement'];

export let mdxAdapter =
	(transform: TransformFunction): TransformFunction =>
	(codemodSource, oldPath, oldData, api, options, callback) => {
		let tree = parseMdx(oldData);

		visit(tree, (node) => {
			if (!JSX_NODE_TYPES.includes(node.type)) {
				return CONTINUE;
			}

			let offsetRange = getNodeOffsetRange(node);

			if (offsetRange === null) {
				return CONTINUE;
			}

			let { start, end } = offsetRange;

			let mdxjsEsmValue = oldData.slice(start, end);

			let transformedMdxjsEsmValue = transform(
				codemodSource,
				oldPath,
				mdxjsEsmValue,
				api,
				options,
				callback,
			);

			if (typeof transformedMdxjsEsmValue !== 'string') {
				return SKIP;
			}

			let root = parseMdx(transformedMdxjsEsmValue);

			let newNode = root.children[0];

			if (newNode === undefined) {
				return SKIP;
			}

			Object.assign(node, newNode);

			return SKIP;
		});

		return stringifyMdx(tree);
	};
