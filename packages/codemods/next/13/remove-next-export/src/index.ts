import { basename, extname } from "node:path";
import type { Filemod } from "@codemod-com/filemod";
import type tsmorph from "ts-morph";

// eslint-disable-next-line @typescript-eslint/ban-types
type Dependencies = Readonly<{
	tsmorph: typeof tsmorph;
}>;

export const repomod: Filemod<Dependencies, Record<string, unknown>> = {
	includePatterns: ["**/package.json", "**/next.config.js", "**/*.{md,sh}"],
	excludePatterns: ["**/node_modules/**"],
	handleData: async (api, path, data) => {
		const extension = extname(path);
		const theBasename = basename(path);

		if (theBasename === "next.config.js") {
			const { tsmorph } = api.getDependencies();

			const project = new tsmorph.Project({
				useInMemoryFileSystem: true,
				skipFileDependencyResolution: true,
				compilerOptions: {
					allowJs: true,
				},
			});

			const sourceFile = project.createSourceFile(path, data);

			const binaryExpressions = sourceFile.getDescendantsOfKind(
				tsmorph.SyntaxKind.BinaryExpression,
			);

			let dirtyFlag = false;

			binaryExpressions.forEach((binaryExpression) => {
				const left = binaryExpression.getLeft();

				if (left.getText() !== "module.exports") {
					return;
				}

				const right = binaryExpression.getRight();

				if (!tsmorph.Node.isObjectLiteralExpression(right)) {
					return;
				}

				right.addPropertyAssignment({
					name: "output",
					initializer: '"export"',
				});

				dirtyFlag = true;
			});

			if (dirtyFlag) {
				return {
					kind: "upsertData",
					path,
					data: sourceFile.getFullText(),
				};
			}
		}

		if (extension === ".json") {
			try {
				const json = JSON.parse(data);
				// follow a happy path, in the worse case it will throw an error
				const entries = Object.entries(json.scripts);

				for (const [key, value] of entries) {
					if (typeof value !== "string") {
						continue;
					}

					if (value.includes("next export")) {
						delete json.scripts[key];
					}
				}

				const newData = JSON.stringify(json);

				return {
					kind: "upsertData",
					path,
					data: newData,
				};
			} catch (error) {
				return {
					kind: "noop",
				};
			}
		}

		if (extension === ".md" || extension === ".sh") {
			const newData = data
				.split("\n")
				.filter((line) => !line.includes("next export"))
				.join("\n");

			if (newData === data) {
				return {
					kind: "noop",
				};
			}

			return {
				kind: "upsertData",
				path,
				data: newData,
			};
		}

		return {
			kind: "noop",
		};
	},
};
