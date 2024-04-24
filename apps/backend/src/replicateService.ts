import Replicate from "replicate";

export class ReplicateService {
	private readonly __replicate: Replicate | null;
	private readonly __timeout = 60_000;

	public constructor(auth: string | null) {
		this.__replicate =
			auth !== null
				? new Replicate({
						auth,
					})
				: null;
	}

	public async complete(prompt: string): Promise<string | null> {
		if (this.__replicate === null) {
			throw new Error(
				"The Replicate service requires the authentication key to be provided",
			);
		}

		const abortController = new AbortController();

		const runPromise = this.__replicate.run(
			"replit/replit-code-v1-3b:b84f4c074b807211cd75e3e8b1589b6399052125b4c27106e43d47189e8415ad",
			{
				input: {
					prompt,
					max_length: 512,
				},

				wait: {
					interval: this.__timeout,
				},
				signal: abortController.signal,
			},
		);

		const timeoutPromise = new Promise<null>((resolve) => {
			setTimeout(() => {
				resolve(null);
			}, this.__timeout);
		});

		const output = await Promise.race([runPromise, timeoutPromise]);

		abortController.abort();

		return Array.isArray(output) && typeof output[0] === "string"
			? output[0]
			: null;
	}
}
