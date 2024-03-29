// Tsconfig issue, requires to set to NodeNext, but this breaks other imports. TODO:
import {
	type ProjectDownloadInput,
	getCodemodProjectFiles,
	// @ts-ignore
} from "@codemod-com/utilities/package-boilerplate";
import initSwc, { transform } from "@swc/wasm-web";
import JSZip from "jszip";

export const downloadProject = async (input: ProjectDownloadInput) => {
	const zip = new JSZip();

	const files: Record<string, string> = getCodemodProjectFiles(input);
	for (const [name, content] of Object.entries(files)) {
		zip.file(name, content);
	}

	// Pre-built file
	await initSwc();
	// biome-ignore lint: typescript is broken
	const { code: compiled } = await transform(files["src/index.ts"]!, {
		minify: true,
		module: { type: "commonjs" },
		jsc: {
			target: "es5",
			loose: false,
			parser: { syntax: "typescript", tsx: true },
		},
	});
	zip.file("dist/index.cjs", `/*! @license\n${files.LICENSE}\n*/\n${compiled}`);

	const blob = await zip.generateAsync({ type: "blob" });

	// download hack
	const link = document.createElement("a");
	link.href = window.URL.createObjectURL(blob);
	link.download = `${input.name}.zip`;
	link.click();
	window.URL.revokeObjectURL(link.href);
};
