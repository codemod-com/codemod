import type { FSWatcher } from "node:fs";
import { watch, type PathLike } from "node:fs";

export class FileWatcher {
	private __fsWatcher: FSWatcher | null = null;
	public constructor(
		private readonly __pathLike: PathLike,
		private readonly __callback: () => void,
	) {}

	public watch() {
		this.__fsWatcher = watch(this.__pathLike, (watchEventType) => {
			if (watchEventType !== "change") {
				return;
			}

			this.__callback();
		});
	}

	public close() {
		this.__fsWatcher?.close();

		this.__fsWatcher = null;
	}
}
