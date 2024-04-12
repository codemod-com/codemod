import platformPath from "node:path";
import { go } from "fuzzysort";
import type { CaseHash } from "../cases/types";
import type { RootState } from "../data";
import type { JobHash } from "../jobs/types";
import { LeftRightHashSetManager } from "../leftRightHashes/leftRightHashSetManager";
import type {
	_ExplorerNode,
	_ExplorerNodeHashDigest,
} from "../persistedState/explorerNodeCodec";
import { buildHash, isNeitherNullNorUndefined } from "../utilities";
import {
	comparePersistedJobs,
	doesJobAddNewFile,
	getPersistedJobUri,
} from "./comparePersistedJobs";

const FUZZY_SEARCH_MINIMUM_SCORE = -1000;
export const selectSearchPhrase = (state: RootState, caseHash: CaseHash) =>
	(state.explorerSearchPhrases[caseHash] ?? "").trim().toLocaleLowerCase();

export const selectExplorerNodes = (
	state: RootState,
	caseHash: CaseHash,
	rootPath: string,
) => {
	const kase = state.case.entities[caseHash] ?? null;

	if (kase === null) {
		return;
	}

	const nodes: Record<_ExplorerNodeHashDigest, _ExplorerNode> = {};

	// we can iterate through the sets based on the insertion order
	// that's why we can push hashes into the set coming from
	// the alphanumerical sorting of the job URIs and the iteration order
	// is maintained
	const children: Record<
		_ExplorerNodeHashDigest,
		Set<_ExplorerNodeHashDigest>
	> = {};

	const rootNode: _ExplorerNode = {
		kind: "ROOT",
		hashDigest: buildHash("ROOT") as _ExplorerNodeHashDigest,
		label: platformPath.basename(rootPath),
		depth: 0,
		childCount: 0,
	};

	nodes[rootNode.hashDigest] = rootNode;
	children[rootNode.hashDigest] = new Set();

	const caseJobManager = new LeftRightHashSetManager<CaseHash, JobHash>(
		new Set(state.caseHashJobHashes),
	);

	const jobs = Array.from(caseJobManager.getRightHashesByLeftHash(kase.hash))
		.map((jobHash) => state.job.entities[jobHash])
		.filter(isNeitherNullNorUndefined);

	const filteredJobs = jobs.sort(comparePersistedJobs);

	const properSearchPhrase = selectSearchPhrase(state, caseHash);

	const allJobPaths = filteredJobs
		.map((j) => {
			const uri = getPersistedJobUri(j);

			return uri?.fsPath.toLocaleLowerCase() ?? null;
		})
		.filter(isNeitherNullNorUndefined);

	const searchResults = go(properSearchPhrase, allJobPaths)
		.filter((r) => r.score > FUZZY_SEARCH_MINIMUM_SCORE)
		.map((r) => r.target);

	for (const job of filteredJobs) {
		const uri = getPersistedJobUri(job);

		if (uri === null) {
			continue;
		}

		if (
			properSearchPhrase !== "" &&
			!searchResults.includes(uri.fsPath.toLocaleLowerCase())
		) {
			continue;
		}

		const path = uri.fsPath.replace(rootPath, "");

		path
			.split(platformPath.sep)
			.filter((name) => name !== "")
			.map((name, i, names) => {
				if (names.length - 1 === i) {
					return {
						kind: "FILE" as const,
						hashDigest: buildHash(
							["FILE", job.hash, name].join(""),
						) as _ExplorerNodeHashDigest,
						path,
						label: name,
						depth: 0,
						jobHash: job.hash,
						fileAdded: doesJobAddNewFile(job.kind),
					};
				}

				const directoryPath = names.slice(0, i + 1).join(platformPath.sep);

				return {
					kind: "DIRECTORY" as const,
					path: directoryPath,
					hashDigest: buildHash(
						["DIRECTORY", directoryPath, name].join(""),
					) as _ExplorerNodeHashDigest,
					label: name,
					depth: 0,
					childCount: 0,
				};
			})
			.forEach((node, i, pathNodes) => {
				const parentNodeHash =
					i === 0
						? rootNode.hashDigest
						: pathNodes[i - 1]?.hashDigest ?? rootNode.hashDigest;

				children[parentNodeHash]?.add(node.hashDigest);

				nodes[node.hashDigest] = node;
				children[node.hashDigest] = children[node.hashDigest] ?? new Set();
			});
	}

	const explorerNodes: _ExplorerNode[] = [];

	const collapseNodes = (hashDigest: _ExplorerNodeHashDigest) => {
		const node = nodes[hashDigest] ?? null;

		if (node === null) {
			return;
		}

		const childNodes = Array.from(children[node.hashDigest] ?? []).map(
			(childHash) => nodes[childHash],
		);

		if (childNodes.length === 1 && childNodes[0]?.kind === "DIRECTORY") {
			const firstChild = childNodes[0];
			const nextNode = {
				...node,
				label: `${node.label}/${childNodes[0].label}`,
			};

			nodes[node.hashDigest] = nextNode;

			const grandchildren = children[firstChild.hashDigest] ?? new Set();

			children[node.hashDigest] = grandchildren;
			delete nodes[firstChild.hashDigest];
			delete children[firstChild.hashDigest];

			collapseNodes(node.hashDigest);
		}
	};

	const appendExplorerNode = (
		hashDigest: _ExplorerNodeHashDigest,
		depth: number,
	) => {
		collapseNodes(hashDigest);

		let node = nodes[hashDigest] ?? null;

		let selectedFileCount = 0;

		if (node === null) {
			return selectedFileCount;
		}

		node = { ...node, depth };

		// all folders must come before all files given that they are at the same depth
		const sortedChildren = Array.from(children[node.hashDigest] ?? []).sort(
			(hashA, hashB) => {
				const childA = nodes[hashA];
				const childB = nodes[hashB];
				if (!childA || !childB) {
					return 0;
				}
				if (childA.kind === "DIRECTORY" && childB.kind === "FILE") {
					return -1;
				}
				if (childA.kind === "FILE" && childB.kind === "DIRECTORY") {
					return 1;
				}
				return 0;
			},
		);

		selectedFileCount = sortedChildren
			.map((childHash) => nodes[childHash])
			.filter(
				(node) =>
					node?.kind === "FILE" &&
					state.selectedExplorerNodes[caseHash]?.includes(node.hashDigest),
			).length;

		const pushedAtIndex = explorerNodes.push(node) - 1;

		sortedChildren.forEach((child) => {
			selectedFileCount += appendExplorerNode(child, depth + 1);
		});

		if (node.kind === "FILE") {
			return selectedFileCount;
		}

		explorerNodes[pushedAtIndex] = {
			...node,
			childCount: selectedFileCount,
		};

		return selectedFileCount;
	};

	appendExplorerNode(rootNode.hashDigest, 0);

	return explorerNodes;
};

export const selectNodeData = (
	state: RootState,
	caseHash: CaseHash,
	explorerNodes: _ExplorerNode[],
) => {
	const collapsedExplorerNodes = state.collapsedExplorerNodes[caseHash] ?? [];
	const reviewedExplorerNodes = state.reviewedExplorerNodes[caseHash] ?? [];

	let maximumDepth = Number.MAX_SAFE_INTEGER;

	return (
		explorerNodes
			?.map((node) => {
				if (maximumDepth < node.depth) {
					return null;
				}

				if (maximumDepth === node.depth) {
					maximumDepth = Number.MAX_SAFE_INTEGER;
				}

				const collapsed =
					node.kind !== "FILE" &&
					collapsedExplorerNodes.includes(node.hashDigest);

				if (collapsed) {
					maximumDepth = node.depth;
				}

				const reviewed =
					node.kind === "FILE" &&
					reviewedExplorerNodes.includes(node.hashDigest);

				return {
					node,
					depth: node.depth,
					expanded: !collapsed,
					reviewed,
					focused: state.focusedExplorerNodes[caseHash] === node.hashDigest,
					collapsable: node.kind !== "FILE",
				};
			})
			.filter(isNeitherNullNorUndefined) ?? []
	);
};

export const selectExplorerTree = (state: RootState, rootPath: string) => {
	const caseHash = state.codemodRunsTab.selectedCaseHash as CaseHash | null;

	if (state.caseHashInProgress === caseHash) {
		return null;
	}

	if (caseHash === null) {
		return null;
	}

	const kase = state.case.entities[caseHash] ?? null;

	if (kase === null) {
		return null;
	}

	const explorerNodes = selectExplorerNodes(state, caseHash, rootPath) ?? [];
	const nodeData = selectNodeData(state, caseHash, explorerNodes);
	const nodes = explorerNodes;

	const fileNodes = nodes.filter(
		(node): node is _ExplorerNode & { kind: "FILE" } => node.kind === "FILE",
	);

	const selectedExplorerNodeHashDigests =
		state.selectedExplorerNodes[caseHash] ?? [];

	const selectedFiles = fileNodes.filter((node) =>
		selectedExplorerNodeHashDigests.includes(node.hashDigest),
	);

	const selectedJobHashes = selectedFiles.map(({ jobHash }) => jobHash);

	const indeterminateExplorerNodeHashDigests =
		state.indeterminateExplorerNodes[caseHash] ?? [];

	return {
		caseHash,
		nodeData,
		focusedNodeHashDigest: state.focusedExplorerNodes[caseHash] ?? null,
		collapsedNodeHashDigests: state.collapsedExplorerNodes[caseHash] ?? [],
		selectedExplorerNodeHashDigests,
		searchPhrase: state.explorerSearchPhrases[caseHash] ?? "",
		selectedJobHashes,
		selectedJobCount: selectedFiles.length,
		indeterminateExplorerNodeHashDigests,
	};
};

export type ExplorerTree = NonNullable<ReturnType<typeof selectExplorerTree>>;
