import type { Filemod } from "@codemod-com/filemod";
import type jscodeshift from "jscodeshift";

type Dependencies = {
	jscodeshift: typeof jscodeshift;
};

type State = {
	featureFlagsExtracted: boolean;
	names: string[];
};

const FILE_MARKER = "fileMarker";
const FEATURE_FLAG_NAME = "featureFlagName";
const FUNCTION_NAME = "functionName";

export const repomod: Filemod<Dependencies, State> = {
	includePatterns: ["**/*.{js,jsx,ts,tsx,cjs,mjs}"],
	excludePatterns: ["**/node_modules/**"],
	initializeState: async (_, previousState) => {
		return (
			previousState ?? {
				featureFlagsExtracted: false,
				names: [],
			}
		);
	},
	handleFinish: async (_, state) => {
		if (state === null || state.featureFlagsExtracted) {
			return { kind: "noop" };
		}

		state.featureFlagsExtracted = true;

		return {
			kind: "restart",
		};
	},
	handleData: async (api, path, data, options, state) => {
		const marker =
			typeof options[FILE_MARKER] === "string" ? options[FILE_MARKER] : null;

		const featureFlagName =
			typeof options[FEATURE_FLAG_NAME] === "string"
				? options[FEATURE_FLAG_NAME]
				: null;

		const functionName =
			typeof options[FUNCTION_NAME] === "string"
				? options[FUNCTION_NAME]
				: null;

		if (!state || marker === null || featureFlagName === null) {
			return {
				kind: "noop",
			};
		}

		const { jscodeshift } = api.getDependencies();

		const { featureFlagsExtracted, names: functionNames } = state;

		if (!featureFlagsExtracted && data.includes(marker)) {
			const root = jscodeshift.withParser("tsx")(data);

			const collection = root.find(jscodeshift.ExportNamedDeclaration);

			collection.forEach(({ node }) => {
				if (node.declaration?.type !== "VariableDeclaration") {
					return;
				}

				return node.declaration.declarations.forEach((declaration) => {
					if (
						declaration.type !== "VariableDeclarator" ||
						declaration.init?.type !== "CallExpression" ||
						declaration.init.callee.type !== "Identifier" ||
						declaration.init.callee.name !== functionName
					) {
						return false;
					}

					const [zerothArgument] = declaration.init.arguments;

					if (zerothArgument?.type !== "ObjectExpression") {
						return false;
					}

					const [property] = zerothArgument.properties;

					if (
						property?.type !== "ObjectProperty" ||
						property.key.type !== "Identifier" ||
						property.key.name !== "key" ||
						property.value.type !== "StringLiteral" ||
						property.value.value !== featureFlagName ||
						declaration.id.type !== "Identifier"
					) {
						return false;
					}

					state?.names.push(declaration.id.name);
				});
			});
		}

		if (featureFlagsExtracted) {
			let dirtyFlag = false;

			const root = jscodeshift.withParser("tsx")(data);

			for (const name of functionNames) {
				root
					.find(jscodeshift.CallExpression, {
						type: "CallExpression",
						callee: {
							type: "Identifier",
							name,
						},
					})
					.replaceWith(() => {
						dirtyFlag = true;

						return {
							type: "BooleanLiteral",
							value: true,
						};
					});

				root
					.find(jscodeshift.AwaitExpression, {
						type: "AwaitExpression",
						argument: {
							type: "BooleanLiteral",
						},
					})
					.replaceWith(({ node }) => {
						dirtyFlag = true;

						return node.argument;
					});
			}

			if (dirtyFlag) {
				return {
					kind: "upsertData",
					path,
					data: root.toSource(),
				};
			}
		}

		return {
			kind: "noop",
		};
	},
};
