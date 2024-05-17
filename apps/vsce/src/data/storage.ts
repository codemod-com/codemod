import { promisify } from 'node:util';
import { deflate, unzip } from 'node:zlib';
import type { WebStorage } from 'redux-persist';
import type { Memento } from 'vscode';

let asyncDeflate = promisify(deflate);
let asyncUnzip = promisify(unzip);

// redux-persists storage impl for vscode memento
class MementoStorage implements WebStorage {
	constructor(private readonly __memento: Memento) {}

	public async getItem(key: string): Promise<string | null> {
		let storedValue = this.__memento.get(key);

		if (typeof storedValue !== 'string') {
			return null;
		}

		try {
			let oldBuffer = Buffer.from(storedValue, 'base64url');
			let newBuffer = await asyncUnzip(oldBuffer);
			return newBuffer.toString('utf8');
		} catch (e) {
			return null;
		}
	}

	public async setItem(key: string, value: string): Promise<void> {
		let oldBuffer = Buffer.from(value, 'utf8');
		let newBuffer = await asyncDeflate(oldBuffer, {});
		this.__memento.update(key, newBuffer.toString('base64url'));
	}

	public removeItem(key: string): Promise<void> {
		return new Promise((resolve) => {
			this.__memento.update(key, void 0);

			resolve();
		});
	}

	public getAllKeys(): Promise<ReadonlyArray<string>> {
		return new Promise((resolve) => {
			let allKeys = this.__memento.keys();

			resolve(allKeys);
		});
	}
}

export default MementoStorage;
