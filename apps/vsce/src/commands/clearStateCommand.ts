import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { FileType, Uri, workspace } from "vscode";
import type { FileService } from "../components/fileService";
import type { Store } from "../data";
import { actions } from "../data/slice";
import { doesJobAddNewFile } from "../selectors/comparePersistedJobs";

type Dependencies = Readonly<{
	store: Store;
	fileService: FileService;
}>;

export const createClearStateCommand =
	({ fileService, store }: Dependencies) =>
	async () => {
		const state = store.getState();

		store.dispatch(actions.clearState());

		try {
			const uris: Uri[] = [];

			for (const job of Object.values(state.job.entities)) {
				if (
					!job ||
					!doesJobAddNewFile(job.kind) ||
					job.newContentUri === null ||
					job.newContentUri.includes(".codemod/cases")
				) {
					continue;
				}

				uris.push(Uri.parse(job.newContentUri));
			}

			await fileService.deleteFiles({ uris });
		} catch (error) {
			console.error(error);
		}

		try {
			const casePath = join(homedir(), ".codemod", "cases");
			if (!existsSync(casePath)) {
				store.dispatch(actions.onStateCleared());
				return;
			}
			const casesDirectoryUri = Uri.parse(casePath);

			const files = await workspace.fs.readDirectory(casesDirectoryUri);

			const caseDirectoryUris = files
				.filter(([, fileType]) => fileType === FileType.Directory)
				.map(([name]) => Uri.joinPath(casesDirectoryUri, name));

			await fileService.deleteDirectories({ uris: caseDirectoryUris });
		} catch (error) {
			console.error(error);
		}

		store.dispatch(actions.onStateCleared());
	};
