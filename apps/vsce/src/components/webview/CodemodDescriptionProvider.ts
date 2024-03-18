import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { EventEmitter, FileSystem, Uri } from "vscode";
import { buildCodemodMetadataHash } from "../../utilities";

export class CodemodDescriptionProvider {
	private __descriptions = new Map<string, string>();
	public onDidChangeEmitter = new EventEmitter<null>();
	public onDidChange = this.onDidChangeEmitter.event;

	constructor(private readonly __fileSystem: FileSystem) {}

	public getCodemodDescription(name: string): string {
		const hash = buildCodemodMetadataHash(name);

		const hashDigest = createHash("ripemd160").update(name).digest("base64url");

		const path = join(homedir(), ".codemod", hashDigest, "description.md");

		if (!existsSync(path)) {
			return "No description or metadata found.";
		}

		const data = this.__descriptions.get(hash) ?? null;

		if (data !== null) {
			return data;
		}

		this.__fileSystem.readFile(Uri.file(path)).then((uint8array) => {
			const data = uint8array.toString();

			this.__descriptions.set(hash, data);

			this.onDidChangeEmitter.fire(null);
		});

		return "No description or metadata found.";
	}
}
