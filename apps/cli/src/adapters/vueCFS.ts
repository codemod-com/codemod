import stringify from "vue-sfc-descriptor-to-string";
import { parseComponent } from "vue-template-compiler/build";

type TransformFunction = (
	codemodSource: string,
	oldPath: string,
	oldData: string,
	...rest: unknown[]
) => string;

export const vueCFSAdapter =
	(transform: TransformFunction): TransformFunction =>
	(codemodSource, oldPath, oldData, api, options, callback) => {
		const descriptor = parseComponent(oldData);

		const { script, scriptSetup } = descriptor;

		[script, scriptSetup].forEach((script) => {
			if (!script) {
				return;
			}

			const newScriptContent = transform(
				codemodSource,
				oldPath,
				script.content,
				api,
				options,
				callback,
			);

			if (typeof newScriptContent !== "string") {
				return;
			}

			script.content = newScriptContent;
		});

		return stringify(descriptor);
	};
