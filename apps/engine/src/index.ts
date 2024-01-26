#!/usr/bin/env node
import { isMainThread } from 'node:worker_threads';

if (isMainThread) {
	import('./executeMainThread.js')
		.then(({ executeMainThread }) => executeMainThread())
		.catch((error) => {
			if (error instanceof Error) {
				console.error(JSON.stringify({ message: error.message }));
			}
		});
} else {
	import('./executeWorkerThread.js').then(({ executeWorkerThread }) =>
		executeWorkerThread(),
	);
}
