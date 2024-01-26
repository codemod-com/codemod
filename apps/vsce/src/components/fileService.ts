import { dirname } from 'node:path';
import { Uri, workspace } from 'vscode';
import type { Message, MessageBus } from './messageBus';
import { MessageKind } from './messageBus';

export class FileService {
	readonly #messageBus: MessageBus;

	public constructor(readonly messageBus: MessageBus) {
		this.#messageBus = messageBus;

		this.#messageBus.subscribe(MessageKind.createFile, (message) =>
			this.#onCreateFile(message),
		);

		this.#messageBus.subscribe(MessageKind.updateFile, (message) =>
			this.#onUpdateFile(message),
		);

		this.#messageBus.subscribe(MessageKind.moveFile, (message) =>
			this.#onMoveFile(message),
		);

		this.#messageBus.subscribe(MessageKind.deleteFiles, (message) =>
			this.#onDeleteFile(message),
		);

		this.#messageBus.subscribe(MessageKind.deleteDirectories, (message) =>
			this.#onDeleteDirectory(message),
		);
	}

	async #onCreateFile(message: Message & { kind: MessageKind.createFile }) {
		await this.createFile(message);
	}

	async #onUpdateFile(message: Message & { kind: MessageKind.updateFile }) {
		await this.updateFile(message);
	}

	async #onMoveFile(message: Message & { kind: MessageKind.moveFile }) {
		await this.moveFile(message);
	}

	async #onDeleteFile(message: Message & { kind: MessageKind.deleteFiles }) {
		await this.deleteFiles(message);
	}

	async #onDeleteDirectory(
		message: Message & { kind: MessageKind.deleteDirectories },
	) {
		await this.deleteDirectories(message);
	}

	public async createFile(params: {
		newUri: Uri;
		newContentUri: Uri;
	}): Promise<void> {
		const content = await workspace.fs.readFile(params.newContentUri);

		const directory = dirname(params.newUri.fsPath);

		await workspace.fs.createDirectory(Uri.file(directory));

		await workspace.fs.writeFile(params.newUri, content);
	}

	public async updateFileContent(params: { uri: Uri; content: string }) {
		await workspace.fs.writeFile(params.uri, Buffer.from(params.content));
	}

	public async updateFile(params: {
		uri: Uri;
		contentUri: Uri;
	}): Promise<void> {
		const content = await workspace.fs.readFile(params.contentUri);
		await workspace.fs.writeFile(params.uri, content);
	}

	public async moveFile(params: {
		newUri: Uri;
		oldUri: Uri;
		newContentUri: Uri;
	}): Promise<void> {
		const content = await workspace.fs.readFile(params.newContentUri);

		const directory = dirname(params.newUri.fsPath);

		await workspace.fs.createDirectory(Uri.file(directory));

		await workspace.fs.writeFile(params.newUri, content);

		await this.deleteFiles({ uris: [params.oldUri] });
	}

	public async deleteDirectories(params: {
		uris: ReadonlyArray<Uri>;
	}): Promise<void> {
		for (const uri of params.uris) {
			try {
				await workspace.fs.delete(uri, {
					recursive: true,
					useTrash: false,
				});
			} catch (error) {
				console.error(error);
			}
		}
	}

	public async deleteFiles(params: {
		uris: ReadonlyArray<Uri>;
	}): Promise<void> {
		for (const uri of params.uris) {
			try {
				await workspace.fs.delete(uri, {
					recursive: false,
					useTrash: false,
				});
			} catch (error) {
				console.error(error);
			}
		}
	}
}
