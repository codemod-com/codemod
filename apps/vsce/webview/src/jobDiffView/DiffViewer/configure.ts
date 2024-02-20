import { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

const ignoreCodes = [
	2304, // unresolved vars
	2451, // redeclared block scope vars
	2552, // undef
];

const configure = (e: editor.IStandaloneDiffEditor, m: Monaco) => {
	m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		diagnosticCodesToIgnore: ignoreCodes,
	});

	const editor = e.getModifiedEditor();
	const model = editor.getModel();

	const path = model?.uri.path;
	const lang = model?.getLanguageId();

	if (lang === "typescript" && path?.endsWith(".tsx")) {
		m.languages.typescript.typescriptDefaults.setCompilerOptions({
			jsx: m.languages.typescript.JsxEmit.React,
		});
	}
};

export default configure;
