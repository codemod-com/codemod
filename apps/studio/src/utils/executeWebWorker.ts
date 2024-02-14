import type { Event } from '../store/slices/log';

export const executeWebWorker = async (content: string, input: string) => {
	return new Promise<[Event[], string | null | undefined]>(
		(resolve, reject) => {
			const worker = new Worker(
				new URL('./webworker.ts', import.meta.url),
				{
					type: 'module',
				},
			);
			worker.postMessage({
				content: String(content),
				input: String(input),
			});

			worker.onmessageerror = () => {
				reject(new Error('Could not deserialize a worker message'));
			};

			worker.onmessage = ({ data: { events, output } }) => {
				resolve([events, output]);
			};

			worker.onerror = (ee) => {
				const error: Error =
					ee.error instanceof Error
						? ee.error
						: Error(String(ee.error));
				reject(error);
			};
		},
	);
};
