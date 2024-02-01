import { join, relative, sep } from 'node:path';
import * as T from 'fp-ts/These';
import * as t from 'io-ts';
import { CodemodEntry, PrivateCodemodEntry } from '../codemods/types';
import { RootState } from '../data';
import { CodemodHash } from '../packageJsonAnalyzer/types';
import { buildHash, capitalize } from '../utilities';

const codemodComCertifiedCodemods = [
	'next/13/app-directory-boilerplate',
	'next/13/built-in-next-font',
	'next/13/comment-deletable-files',
	'next/13/move-css-in-js-styles',
	'next/13/new-image-experimental',
	'next/13/new-link',
	'next/13/next-image-to-legacy-image',
	'next/13/remove-get-static-props',
	'next/13/remove-next-export',
	'next/13/replace-next-head',
	'next/13/replace-next-head-v2',
	'next/13/replace-next-router',
	'next/13/upsert-use-client-directive',
	'next/13/replace-next-head-repomod',
	'next/13/app-router',
	'next/13/app-router-recipe',
	'next/13/replace-api-routes',
];

interface CodemodNodeHashDigestBrand {
	readonly __CodemodNodeHashDigest: unique symbol;
}

export const codemodNodeHashDigestCodec = t.brand(
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

const buildCodemodTitle = (name: string): string => {
	return name
		.split('-')
		.map((word) => capitalize(word))
		.join(' ');
};

export const buildRootNode = () =>
	({
		hashDigest: buildHash('ROOT') as CodemodNodeHashDigest,
		kind: 'ROOT' as const,
		label: '',
	}) as const;

export const buildDirectoryNode = (name: string, path: string) =>
	({
		hashDigest: buildHash([path, name].join('_')) as CodemodNodeHashDigest,
		kind: 'DIRECTORY' as const,
		label: name,
	}) as const;

export const absoluteToRelativePath = (
	absolutePath: string,
	rootPath: string,
) => {
	const basePathWithoutLastDir = rootPath.split(sep).slice(0, -1).join(sep);
	return relative(basePathWithoutLastDir, absolutePath);
};

export const relativeToAbsolutePath = (
	relativePath: string,
	rootPath: string,
) => {
	const basePathWithoutLastDir = rootPath.split(sep).slice(0, -1).join(sep);

	return join(basePathWithoutLastDir, relativePath);
};

export const buildCodemodNode = (
	codemod: CodemodEntry | PrivateCodemodEntry,
	name: string,
	executionPath: string,
	queued: boolean,
	isPrivate: boolean,
	args: ReadonlyArray<CodemodArgumentWithValue>,
) => {
	return {
		kind: 'CODEMOD' as const,
		name: codemod.name,
		isPrivate,
		hashDigest: codemod.hashDigest as CodemodNodeHashDigest,
		label: buildCodemodTitle(name),
		executionPath: T.right(executionPath),
		queued: queued,
		icon: isPrivate
			? 'private'
			: codemodComCertifiedCodemods.includes(codemod.name)
			  ? 'certified'
			  : 'community',
		permalink: isPrivate
			? (codemod as PrivateCodemodEntry).permalink
			: null,
		args,
	} as const;
};

export type CodemodNode =
	| ReturnType<typeof buildRootNode>
	| ReturnType<typeof buildDirectoryNode>
	| ReturnType<typeof buildCodemodNode>;

export const selectPrivateCodemods = (
	state: RootState,
	rootPath: string | null,
	executionQueue: ReadonlyArray<CodemodHash>,
) => {
	const codemods = Object.values(
		state.privateCodemods.entities,
	) as PrivateCodemodEntry[];

	const nodeData: NodeDatum[] = codemods.map((codemod) => {
		const { name, hashDigest } = codemod;
		const { executionPaths } = state.codemodDiscoveryView;

		const executionPath =
			executionPaths[codemod.hashDigest] ?? rootPath ?? '';

		const executionRelativePath = absoluteToRelativePath(
			executionPath,
			rootPath ?? '',
		);

		const args = selectCodemodArguments(
			state,
			codemod.hashDigest as CodemodNodeHashDigest,
		);

		const node = buildCodemodNode(
			codemod,
			name,
			executionRelativePath,
			executionQueue.includes(codemod.hashDigest as CodemodHash),
			true,
			args,
		);

		const argumentsExpanded =
			state.codemodDiscoveryView.codemodArgumentsPopupHashDigest ===
			hashDigest;

		return {
			node,
			depth: 0,
			expanded: false,
			focused:
				state.codemodDiscoveryView.focusedCodemodHashDigest ===
				hashDigest,
			collapsable: false,
			reviewed: false,
			argumentsExpanded,
		};
	});

	return {
		nodeData,
		focusedNodeHashDigest:
			state.codemodDiscoveryView.focusedCodemodHashDigest,
		collapsedNodeHashDigests: [],
	};
};

export const selectCodemodTree = (
	state: RootState,
	rootPath: string | null,
	executionQueue: ReadonlyArray<CodemodHash>,
) => {
	const codemods = Object.values(state.codemod.entities) as CodemodEntry[];
	codemods.sort((a, b) => a.name.localeCompare(b.name));
	const { executionPaths, searchPhrase } = state.codemodDiscoveryView;

	const nodes: Record<CodemodNodeHashDigest, CodemodNode> = {};
	const children: Record<CodemodNodeHashDigest, CodemodNodeHashDigest[]> = {};

	const nodePathMap = new Map<string, CodemodNode>();

	const rootNode = buildRootNode();
	nodes[rootNode.hashDigest] = rootNode;
	children[rootNode.hashDigest] = [];
	codemods.forEach((codemod) => {
		const { name } = codemod;

		const codemodTitle = buildCodemodTitle(name);

		if (
			!codemodTitle
				.trim()
				.toLocaleLowerCase()
				.includes(searchPhrase.trim().toLocaleLowerCase())
		) {
			return;
		}

		const sep = name.indexOf('/') !== -1 ? '/' : ':';

		const pathParts = name.split(sep).filter((part) => part !== '');

		if (pathParts.length === 0) {
			return;
		}

		pathParts.forEach((part, idx) => {
			let currNode: CodemodNode | null = null;
			const codemodDirName = pathParts.slice(0, idx + 1).join(sep);

			if (nodePathMap.has(codemodDirName)) {
				return;
			}

			const parentDirName = pathParts.slice(0, idx).join(sep);

			if (idx === pathParts.length - 1) {
				const executionPath =
					executionPaths[codemod.hashDigest] ?? rootPath ?? '/';

				const executionRelativePath = absoluteToRelativePath(
					executionPath,
					rootPath ?? '',
				);

				const args = selectCodemodArguments(
					state,
					codemod.hashDigest as CodemodNodeHashDigest,
				);

				currNode = buildCodemodNode(
					codemod,
					part,
					executionRelativePath,
					executionQueue.includes(codemod.hashDigest as CodemodHash),
					false,
					args,
				);
			} else {
				currNode = buildDirectoryNode(part, codemodDirName);
			}

			nodePathMap.set(codemodDirName, currNode);
			nodes[currNode.hashDigest] = currNode;

			const parentNode =
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

	const nodeData: NodeDatum[] = [];

	const appendNodeData = (
		hashDigest: CodemodNodeHashDigest,
		depth: number,
	) => {
		const node = nodes[hashDigest] ?? null;

		if (node === null) {
			return;
		}

		const isSearching = searchPhrase.trim().length !== 0;

		// searched nodes should always be expanded
		const expanded =
			isSearching ||
			state.codemodDiscoveryView.expandedNodeHashDigests.includes(
				hashDigest,
			);

		const focused =
			state.codemodDiscoveryView.focusedCodemodHashDigest === hashDigest;
		const childSet = children[node.hashDigest] ?? [];

		const argumentsExpanded =
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

		for (const child of childSet) {
			appendNodeData(child, depth + 1);
		}
	};

	appendNodeData(rootNode.hashDigest, -1);

	const collapsedNodeHashDigests = Object.values(nodes)
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

export const selectExecutionPaths = (state: RootState) => {
	return state.codemodDiscoveryView.executionPaths;
};

export type CodemodArgumentWithValue =
	| {
			kind: 'string';
			name: string;
			description: string;
			required: boolean;
			default?: string;
			value: string;
	  }
	| {
			kind: 'number';
			name: string;
			description: string;
			required: boolean;
			default?: number;
			value: number;
	  }
	| {
			kind: 'boolean';
			name: string;
			description: string;
			required: boolean;
			default?: boolean;
			value: boolean;
	  }
	| {
			kind: 'options';
			name: string;
			description: string;
			required: boolean;
			default?: string;
			options: ReadonlyArray<string>;
			value: string;
	  };

export const selectCodemodArguments = (
	state: RootState,
	hashDigest: CodemodNodeHashDigest | null,
): CodemodArgumentWithValue[] => {
	if (hashDigest === null) {
		return [];
	}

	const argumentsSchema =
		Object.values(state.codemod.entities).find(
			(codemodEntry) => codemodEntry?.hashDigest === hashDigest,
		)?.arguments ?? [];

	const codemodArgumentsValues =
		state.codemodDiscoveryView.codemodArguments[hashDigest] ?? null;

	return argumentsSchema.map((arg) => {
		const value = codemodArgumentsValues?.[arg.name] ?? arg.default ?? '';

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
