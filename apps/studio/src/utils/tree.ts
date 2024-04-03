import { Node } from "@babel/types";
import { OffsetRange } from "~/schemata/offsetRangeSchemata";
import { TreeNode } from "../components/Tree";
import { isNeitherNullNorUndefined } from "./isNeitherNullNorUndefined";

export type RangeCommand =
	| Readonly<{
			kind: "PASS_THROUGH";
			ranges: ReadonlyArray<TreeNode | OffsetRange>;
	  }>
	| Readonly<{
			kind: "FIND_CLOSEST_PARENT";
			ranges: ReadonlyArray<TreeNode | OffsetRange>;
	  }>;

export const buildRanges = (
	rootNode: TreeNode | null,
	rangeCommand: RangeCommand,
): ReadonlyArray<TreeNode | OffsetRange> => {
	if (rootNode === null) {
		return [];
	}

	return rangeCommand.ranges
		.map((range) => {
			if (range.start === range.end) {
				return null;
			}

			if (rangeCommand.kind === "PASS_THROUGH") {
				return range;
			}

			if (rangeCommand.kind === "FIND_CLOSEST_PARENT") {
				return findClosestParentWithinRange(rootNode, range.start, range.end);
			}

			return null;
		})
		.filter(isNeitherNullNorUndefined);
};

//  find the lowest parent common to nodes within range.
function findClosestParentWithinRange(
	tree: TreeNode,
	start: number,
	end: number,
): TreeNode | null {
	let res = null;

	if (tree.start >= end || tree.end <= start) {
		return res;
	}

	if (tree.start <= start && tree.end >= end) {
		res = tree;
	}

	const children = tree.children ?? [];

	for (let i = 0; i < children.length; i += 1) {
		const node = findClosestParentWithinRange(children[i]!, start, end);

		if (node) {
			res = node;
		}
	}

	return res;
}

const extractIdsAndTypes = ({
	id,
	children = [],
	actualNode,
}: TreeNode): ReadonlyArray<
	[TreeNode["id"], TreeNode["actualNode"]["type"]]
> => [
	[id, actualNode.type],
	...children.flatMap((child) => extractIdsAndTypes(child)),
];

const getNodeById = (node: TreeNode, id: string): TreeNode | null => {
	if (node.id === id) {
		return node;
	}

	const children = node.children ?? [];

	// eslint-disable-next-line no-plusplus
	for (let i = 0; i < children.length; i++) {
		const child = children[i]!;
		const found = getNodeById(child, id);
		if (found) {
			return found;
		}
	}

	return null;
};

export const isNode = (node: unknown): node is Node => {
	return (
		typeof node === "object" &&
		node !== null &&
		"type" in node &&
		typeof (node as Node).type === "string"
	);
};

const getNodeHash = ({ type, start, end }: Node): string =>
	`${type}_${start}_${end}`;

export {
	findClosestParentWithinRange,
	extractIdsAndTypes,
	getNodeById,
	getNodeHash,
};
