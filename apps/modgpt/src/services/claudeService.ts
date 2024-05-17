import { object, parse, string } from 'valibot';

export class ClaudeService {
	public constructor(
		private __apiKey: string | null,
		private __maxTokensToSample: number,
	) {}

	public async complete(
		model: 'claude-2.0' | 'claude-instant-1.2',
		prompt: string,
	): Promise<string | null> {
		if (this.__apiKey === null) {
			throw new Error('The Claude Service API key is required');
		}

		let abortController = new AbortController();

		let timeout = 60_000;

		let headers = new Headers({
			accept: 'application/json',
			'anthropic-version': '2023-06-01',
			'content-type': 'application/json',
			'x-api-key': this.__apiKey,
		});

		let responsePromise = fetch('https://api.anthropic.com/v1/complete', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				model,
				prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
				max_tokens_to_sample: this.__maxTokensToSample,
			}),
		});

		let timeoutPromise = new Promise<null>((resolve) => {
			setTimeout(() => {
				resolve(null);
			}, timeout);
		});

		let response = await Promise.race([responsePromise, timeoutPromise]);

		abortController.abort();

		if (response === null) {
			return null;
		}

		let json = await response.json();

		let { completion } = parse(object({ completion: string() }), json);

		return completion;
	}
}
