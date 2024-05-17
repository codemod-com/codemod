export class LeftRightHashSetManager<L extends string, R extends string> {
	private __set = new Set<string>();

	public constructor(set: ReadonlySet<string>) {
		this.__set = new Set(set);
	}

	public getSetValues(): IterableIterator<string> {
		return this.__set.values();
	}

	public buildByRightHashes(
		rightHashes: Set<R>,
	): LeftRightHashSetManager<L, R> {
		let set = new Set<string>();

		this.__set.forEach((leftRightHash) => {
			let rightHash = leftRightHash.slice(leftRightHash.length / 2) as R;

			if (!rightHashes.has(rightHash)) {
				return;
			}

			set.add(leftRightHash);
		});

		return new LeftRightHashSetManager<L, R>(set);
	}

	public getLeftHashes(): ReadonlySet<L> {
		let set = new Set<L>();

		this.__set.forEach((leftRightHash) => {
			let leftHash = leftRightHash.slice(
				0,
				leftRightHash.length / 2,
			) as L;

			set.add(leftHash);
		});

		return set;
	}

	public getRightHashes(): ReadonlySet<R> {
		let rightHashes = new Set<R>();

		this.__set.forEach((leftRightHash) => {
			let rightHash = leftRightHash.slice(leftRightHash.length / 2) as R;

			rightHashes.add(rightHash);
		});

		return rightHashes;
	}

	public getRightHashesByLeftHash(leftHash: L): ReadonlySet<R> {
		let rightHashes = new Set<R>();

		this.__set.forEach((leftRightHash) => {
			if (!leftRightHash.startsWith(leftHash)) {
				return;
			}

			let rightHash = leftRightHash.slice(leftHash.length);

			rightHashes.add(rightHash as R);
		});

		return rightHashes;
	}

	public upsert(leftHash: L, rightHash: R): void {
		let hash = this.#buildLeftRightHash(leftHash, rightHash);

		this.__set.add(hash);
	}

	public delete(leftHash: L, rightHash: R): boolean {
		let hash = this.#buildLeftRightHash(leftHash, rightHash);

		return this.__set.delete(hash);
	}

	public deleteRightHash(rightHash: R): void {
		let deletableHashes: string[] = [];

		for (let leftRightHash of this.__set.keys()) {
			if (leftRightHash.endsWith(rightHash)) {
				deletableHashes.push(leftRightHash);
			}
		}

		for (let hash of deletableHashes) {
			this.__set.delete(hash);
		}
	}

	public clear(): void {
		this.__set.clear();
	}

	#buildLeftRightHash(leftHash: L, rightHash: R): string {
		return `${leftHash}${rightHash}`;
	}
}
