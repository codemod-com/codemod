import { join, relative, sep } from 'node:path';
import * as T from 'fp-ts/These';
import * as t from 'io-ts';
import type { CodemodEntry } from '../codemods/types';
import type { RootState } from '../data';
import type { CodemodHash } from '../packageJsonAnalyzer/types';
import { buildHash, capitalize } from '../utilities';

interface CodemodNodeHashDigestBrand {
	readonly __CodemodNodeHashDigest: unique symbol;
}

export let codemodNodeHashDigestCodec = t.brand(
	t.string,
	(hashDigest): hashDigest is t.Branded<string, CodemodNodeHashDigestBrand> =>
		hashDigest.length > 0,
	'__CodemodNodeHashDigest',
);

export type CodemodNodeHashDigest = t.TypeOf<typeof codemodNodeHashDigestCodec>;

export type NodeDatum = Readonly<{
	node: CodemodNode;
	depth: number;
	expanded: boolean;
	focused: boolean;
	collapsable: boolean;
	reviewed: boolean;
	argumentsExpanded: boolean;
}>;

let buildCodemodTitle = (name: string): string => {
	return name
		.split('-')
		.map((word) => capitalize(word))
		.join(' ');
};

export let buildRootNode = () =>
	({
		hashDigest: buildHash('ROOT') as CodemodNodeHashDigest,
		kind: 'ROOT' as const,
		label: '',
	}) as const;

export let buildDirectoryNode = (name: string, path: string) =>
	({
		hashDigest: buildHash([path, name].join('_')) as CodemodNodeHashDigest,
		kind: 'DIRECTORY' as const,
		label: name,
	}) as const;

export let absoluteToRelativePath = (
	absolutePath: string,
	rootPath: string,
) => {
	let basePathWithoutLastDir = rootPath.split(sep).slice(0, -1).join(sep);
	return relative(basePathWithoutLastDir, absolutePath);
};

export let relativeToAbsolutePath = (
	relativePath: string,
	rootPath: string,
) => {
	let basePathWithoutLastDir = rootPath.split(sep).slice(0, -1).join(sep);

	return join(basePathWithoutLastDir, relativePath);
};

export let buildCodemodNode = (
	codemod: CodemodEntry,
	name: string,
	executionPath: string,
	queued: boolean,
	args: ReadonlyArray<CodemodArgumentWithValue>,
) => {
	return {
		kind: 'CODEMOD' as const,
		name: codemod.name,
		hashDigest: codemod.hashDigest as CodemodNodeHashDigest,
		label: buildCodemodTitle(name),
		executionPath: T.right(executionPath),
		queued: queued,
		icon: codemod.verified ? 'certified' : 'community',
		permalink: null,
		args,
	} as const;
};

export type CodemodNode =
	| ReturnType<typeof buildRootNode>
	| ReturnType<typeof buildDirectoryNode>
	| ReturnType<typeof buildCodemodNode>;

export let selectCodemodTree = (
	state: RootState,
	rootPath: string | null,
	executionQueue: ReadonlyArray<CodemodHash>,
) => {
	let codemods = Object.values(state.codemod.entities) as CodemodEntry[];
	codemods.sort((a, b) => a.name.localeCompare(b.name));
	let { executionPaths, searchPhrase } = state.codemodDiscoveryView;

	let nodes: Record<CodemodNodeHashDigest, CodemodNode> = {};
	let children: Record<CodemodNodeHashDigest, CodemodNodeHashDigest[]> = {};

	let nodePathMap = new Map<string, CodemodNode>();

	let rootNode = buildRootNode();
	nodes[rootNode.hashDigest] = rootNode;
	children[rootNode.hashDigest] = [];
	codemods.forEach((codemod) => {
		let { name } = codemod;

		let codemodTitle = buildCodemodTitle(name);

		if (
			!codemodTitle
				.trim()
				.toLocaleLowerCase()
				.includes(searchPhrase.trim().toLocaleLowerCase())
		) {
			return;
		}

		let sep = name.indexOf('/') !== -1 ? '/' : ':';

		let pathParts = name.split(sep).filter((part) => part !== '');

		if (pathParts.length === 0) {
			return;
		}

		pathParts.forEach((part, idx) => {
			let currNode: CodemodNode | null = null;
			let codemodDirName = pathParts.slice(0, idx + 1).join(sep);

			if (nodePathMap.has(codemodDirName)) {
				return;
			}

			let parentDirName = pathParts.slice(0, idx).join(sep);

			if (idx === pathParts.length - 1) {
				let executionPath =
					executionPaths[codemod.hashDigest] ?? rootPath ?? '/';

				let executionRelativePath = absoluteToRelativePath(
					executionPath,
					rootPath ?? '',
				);

				let args = selectCodemodArguments(
					state,
					codemod.hashDigest as CodemodNodeHashDigest,
				);

				currNode = buildCodemodNode(
					codemod,
					part,
					executionRelativePath,
					executionQueue.includes(codemod.hashDigest as CodemodHash),
					args,
				);
			} else {
				currNode = buildDirectoryNode(part, codemodDirName);
			}

			nodePathMap.set(codemodDirName, currNode);
			nodes[currNode.hashDigest] = currNode;

			let parentNode =
				idx === 0 ? rootNode : nodePathMap.get(parentDirName) ?? null;

			if (parentNode === null) {
				return;
			}

			if (children[parentNode.hashDigest] === undefined) {
				children[parentNode.hashDigest] = [];
			}

			children[parentNode.hashDigest]?.push(currNode.hashDigest);
		});
	});

	let nodeData: NodeDatum[] = [];

	let appendNodeData = (hashDigest: CodemodNodeHashDigest, depth: number) => {
		let node = nodes[hashDigest] ?? null;

		if (node === null) {
			return;
		}

		let isSearching = searchPhrase.trim().length !== 0;

		// searched nodes should always be expanded
		let expanded =
			isSearching ||
			state.codemodDiscoveryView.expandedNodeHashDigests.includes(
				hashDigest,
			);

		let focused =
			state.codemodDiscoveryView.focusedCodemodHashDigest === hashDigest;
		let childSet = children[node.hashDigest] ?? [];

		let argumentsExpanded =
			state.codemodDiscoveryView.codemodArgumentsPopupHashDigest ===
			hashDigest;

		if (depth !== -1) {
			nodeData.push({
				node,
				depth,
				expanded,
				focused,
				collapsable: childSet.length !== 0,
				reviewed: false,
				argumentsExpanded,
			});
		}

		if (!expanded && depth !== -1) {
			return;
		}

		for (let child of childSet) {
			appendNodeData(child, depth + 1);
		}
	};

	appendNodeData(rootNode.hashDigest, -1);

	let collapsedNodeHashDigests = Object.values(nodes)
		.map((node) => node.hashDigest)
		.filter(
			(hashDigest) =>
				!state.codemodDiscoveryView.expandedNodeHashDigests.includes(
					hashDigest,
				),
		);

	return {
		nodeData,
		focusedNodeHashDigest:
			state.codemodDiscoveryView.focusedCodemodHashDigest,
		collapsedNodeHashDigests,
	};
};

export let selectExecutionPaths = (state: RootState) => {
	return state.codemodDiscoveryView.executionPaths;
};

type Arguments = CodemodEntry['arguments'][number];
export type CodemodArgumentWithValue =
	| (Extract<Arguments, { kind: 'string' }> & { value: string })
	| (Extract<Arguments, { kind: 'number' }> & { value: number })
	| (Extract<Arguments, { kind: 'boolean' }> & { value: boolean });

export let selectCodemodArguments = (
	state: RootState,
	hashDigest: CodemodNodeHashDigest | null,
): CodemodArgumentWithValue[] => {
	if (hashDigest === null) {
		return [];
	}

	let argumentsSchema =
		Object.values(state.codemod.entities).find(
			(codemodEntry) => codemodEntry?.hashDigest === hashDigest,
		)?.arguments ?? [];

	let codemodArgumentsValues =
		state.codemodDiscoveryView.codemodArguments[hashDigest] ?? null;

	return argumentsSchema.map((arg) => {
		let value = codemodArgumentsValues?.[arg.name] ?? arg.default ?? '';

		switch (arg.kind) {
			case 'string': {
				return {
					...arg,
					value: String(value),
				};
			}
			case 'number': {
				return {
					...arg,
					value: Number(value),
				};
			}
			case 'boolean': {
				return {
					...arg,
					value: value === 'true',
				};
			}
		}
	});

	// @TODO remove `state.codemodDiscoveryView.executionPaths` state. Execution path should be a part of codemodArguments
};

export type CodemodTree = NonNullable<ReturnType<typeof selectCodemodTree>>;
