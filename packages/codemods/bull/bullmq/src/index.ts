import type { API, FileInfo } from 'jscodeshift';
import { replaceTypeReferences } from './correct-types.js';
import { replaceOldQueueImport } from './imports.js';
import { replaceListeners } from './listeners.js';
import { replaceQueueOpts } from './queue.js';
import { replaceProcessWithWorkers } from './worker.js';

export default function transform(
	file: FileInfo,
	api: API,
): string | undefined {
	let j = api.jscodeshift;
	let root = j(file.source);

	replaceOldQueueImport(root, j);
	replaceQueueOpts(root, j);
	replaceTypeReferences(root, j);

	replaceListeners(root, j);
	replaceProcessWithWorkers(root, j);

	return root.toSource();
}
