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
	selectAll: (filter?: Partial<File>) => File[];
	selectById: (hashDigest: string) => File | null;
	selectFirst: (filter: Partial<File>) => File | null;
};

function shallowMatch(
	obj1: { [key: string]: any },
	obj2: { [key: string]: any },
): boolean {
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (const key of keys1) {
		if (!Object.hasOwn(obj2, key) || obj1[key] !== obj2[key]) {
			return false;
		}
	}

	return true;
}

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
	selectAll(filter?: Partial<File>) {
		const allFiles = Object.values(get().files);

		return filter
			? allFiles.filter((file) => shallowMatch(file, filter))
			: allFiles;
	},
	selectFirst(filter: Partial<File>) {
		const allFiles = Object.values(get().files);

		return allFiles.find((file) => shallowMatch(file, filter)) ?? null;
	},
}));
