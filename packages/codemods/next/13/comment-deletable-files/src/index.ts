import { basename } from 'node:path';
import type { API, FileInfo, Transform } from 'jscodeshift';

export default function transform(file: FileInfo, api: API) {
	let baseName = basename(file.path);

	if (
		!baseName.startsWith('_document') &&
		!baseName.startsWith('_app') &&
		!baseName.startsWith('_error')
	) {
		return undefined;
	}

	let { j } = api;

	let root = j(file.source);

	root.find(j.Program).forEach((programPath) => {
		let program = programPath.value;

		let comments = program.comments ?? [];

		comments.push(
			j.commentBlock(
				'This file should be deleted. Please migrate its contents to appropriate files',
			),
		);

		program.comments = comments;
	});

	return root.toSource();
}

transform satisfies Transform;
