import { type PathLike } from 'node:fs';
import { open, type FileHandle } from 'node:fs/promises';
import { type CircularBuffer } from './circularBuffer.js';

export class FileReadingService {
	protected _bytesRead: number = 0;
	protected _busy: boolean = false;
	protected _pendingWork: boolean = false;
	protected _fileHandle: FileHandle | null = null;

	public constructor(
		protected readonly _pathLike: PathLike,
		protected readonly _circularBuffer: CircularBuffer,
	) {}

	public async open() {
		this._fileHandle = await open(this._pathLike, 'r');

		this.onFileChanged();
	}

	public onFileChanged(): void {
		if (this._fileHandle === null) {
			throw new Error(
				'The file has not been opened (or has been closed) but it has been changed by a writer.',
			);
		}

		if (this._busy) {
			this._pendingWork = true;
			return;
		}

		this._busy = true;

		const freeByteLength = this._circularBuffer.getFreeByteLength();

		if (freeByteLength === 0) {
			this._busy = false;

			if (this._pendingWork) {
				this._pendingWork = false;
				process.nextTick(() => this.onFileChanged());
			}

			return;
		}

		const buffer = Buffer.alloc(freeByteLength);

		void this._fileHandle
			.read(buffer, 0, freeByteLength, this._bytesRead)
			.then((fileReadResult) => {
				this._bytesRead += fileReadResult.bytesRead;

				if (fileReadResult.bytesRead === 0) {
					return;
				}

				return this._circularBuffer.write(
					buffer,
					fileReadResult.bytesRead,
				);
			})
			.finally(() => {
				this._busy = false;

				if (this._pendingWork) {
					this._pendingWork = false;

					try {
						this.onFileChanged();
					} catch {
						/* empty */
					}
				}
			});
	}

	public async close() {
		if (this._fileHandle === null) {
			return;
		}

		await this._fileHandle.close();

		this._fileHandle = null;
	}
}
