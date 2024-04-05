import { create } from "zustand";
import { INITIAL_STATE } from "../getInitialState";

export type File = {
	hashDigest: string;
	name: string;
	content: string;
	parent: string | null;
};

type FileState = {
	files: Record<string, File>;
	upsertOne: (hashDigest: string, newFile: File) => void;
	upsertMany: (files: File[]) => void;
	setAll: (files: File[]) => void;
	selectAll: (parentHashDigest?: string) => File[];
	selectById: (hashDigest: string) => File | null;
};

const buildCollection = (files: ReadonlyArray<File>): Record<string, File> =>
	files.reduce<FileState["files"]>((files, file) => {
		files[file.hashDigest] = file;
		return files;
	}, {});

export const getFilesFromPersistance = (): FileState["files"] => {
	const { files } = INITIAL_STATE;

	return buildCollection(files);
};

export const useFilesStore = create<FileState>((set, get) => ({
	files: getFilesFromPersistance(),
	upsertOne(hashDigest, newFile) {
		set((state) => ({
			files: { ...state.files, [hashDigest]: newFile },
		}));
	},
	upsertMany(files: File[]) {
		const updatedFiles = { ...get().files };

		files.forEach((file) => {
			updatedFiles[file.hashDigest] = file;
		});

		set(() => ({ files: updatedFiles }));
	},
	setAll(files: File[]) {
		set(() => ({ files: buildCollection(files) }));
	},
	selectById(hashDigest: string) {
		return get().files[hashDigest] ?? null;
	},
	selectAll(parentHashDigest?: string) {
		const allFiles = Object.values(get().files);

		return parentHashDigest
			? allFiles.filter((file) => file.parent === parentHashDigest)
			: allFiles;
	},
}));
