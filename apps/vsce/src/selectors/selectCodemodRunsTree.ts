import { sep } from "path";
import { RootState } from "../data";
import { isNeitherNullNorUndefined } from "../utilities";

export const selectCodemodRunsTree = (state: RootState, rootPath: string) => {
	const { selectedCaseHash } = state.codemodRunsTab;
	const dirName = rootPath.split(sep).slice(-1).join(sep);

	const nodeData = Object.values(state.case.entities)
		.filter(isNeitherNullNorUndefined)
		.sort((a, b) => a.createdAt - b.createdAt)
		.map((kase) => {
			const label =
				kase.codemodHashDigest !== undefined
					? state.privateCodemods.entities[kase.codemodHashDigest]?.name ??
					  state.codemod.entities[kase.codemodHashDigest]?.name ??
					  kase.codemodName
					: kase.codemodName;

			return {
				node: {
					hashDigest: kase.hash,
					label,
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
