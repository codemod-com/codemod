import { create } from "zustand";

// @TODO when files refactoring completed
export type Directory = {
	hashDigest: string;
	name: string;
	parent: string | null;
};

type DirectoryState = {
	directories: Record<string, Directory>;
	setDirectory: (hashDigest: string, newFile: Directory) => void;
};

export const getDirectoriesFromPersistance =
	(): DirectoryState["directories"] => {
		return {};
	};

export const useSnippetStore = create<DirectoryState>((set, get) => ({
	directories: getDirectoriesFromPersistance(),
	setDirectory() {},
}));
