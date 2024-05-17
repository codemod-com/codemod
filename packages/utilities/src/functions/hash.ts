import { createHash } from 'node:crypto';

export let buildHash = (data: string) =>
	createHash('ripemd160').update(data).digest('base64url');

export let buildCodemodMetadataHash = (name: string) =>
	createHash('ripemd160')
		.update('README.md')
		.update(name)
		.digest('base64url');

// taken from https://stackoverflow.com/a/63361543
export let streamToString = async (stream: NodeJS.ReadableStream) => {
	let chunks = [];

	for await (let chunk of stream) {
		if (chunk instanceof Buffer) {
			chunks.push(chunk);
			continue;
		}

		chunks.push(Buffer.from(chunk));
	}

	return Buffer.concat(chunks).toString('utf-8');
};
