import { sep } from 'node:path';
import type { RootState } from '../data';
import { isNeitherNullNorUndefined } from '../utilities';

export let selectCodemodRunsTree = (state: RootState, rootPath: string) => {
	let { selectedCaseHash } = state.codemodRunsTab;
	let dirName = rootPath.split(sep).slice(-1).join(sep);

	let nodeData = Object.values(state.case.entities)
		.filter(isNeitherNullNorUndefined)
		.sort((a, b) => a.createdAt - b.createdAt)
		.map((kase) => {
			return {
				node: {
					hashDigest: kase.hash,
					label: kase.codemodName,
					createdAt: kase.createdAt,
					path: kase.path.replace(rootPath, dirName),
				} as const,
				depth: 0,
				expanded: true,
				focused: kase.hash === selectedCaseHash,
				collapsable: false,
				reviewed: false,
			} as const;
		});

	return {
		nodeData,
		selectedNodeHashDigest: selectedCaseHash,
	} as const;
};

export type CodemodRunsTree = ReturnType<typeof selectCodemodRunsTree>;
