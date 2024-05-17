import { parse } from '@vue/compiler-sfc';
// @ts-ignore
import stringify from 'vue-sfc-descriptor-to-string';

type TransformFunction = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	...rest: unknown[]
) => string;

export let vue3SFCAdapter =
	(transform: TransformFunction): TransformFunction =>
	(codemodSource, oldPath, oldData, api, options, callback) => {
		let { descriptor } = parse(oldData);

		let { script, scriptSetup } = descriptor;

		[script, scriptSetup].forEach((script) => {
			if (script === null) {
				return;
			}

			let newScriptContent = transform(
				codemodSource,
				oldPath,
				script.content,
				api,
				options,
				callback,
			);

			if (typeof newScriptContent !== 'string') {
				return;
			}

			script.content = newScriptContent;
		});

		return stringify(descriptor);
	};
