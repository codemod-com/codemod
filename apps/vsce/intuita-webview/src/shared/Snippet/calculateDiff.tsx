import type { editor } from 'monaco-editor';

export type Diff = { added: number; removed: number };

export const getDiff = (lineChanges: editor.ILineChange[]): Diff => {
	const diff: Diff = {
		added: 0,
		removed: 0,
	};
	lineChanges.forEach((lineChange) => {
		if (lineChange.modifiedEndLineNumber !== 0) {
			diff.added +=
				lineChange.modifiedEndLineNumber -
				lineChange.modifiedStartLineNumber +
				1;
		}
		if (lineChange.originalEndLineNumber !== 0) {
			diff.removed +=
				lineChange.originalEndLineNumber -
				lineChange.originalStartLineNumber +
				1;
		}
	});

	return diff;
};
