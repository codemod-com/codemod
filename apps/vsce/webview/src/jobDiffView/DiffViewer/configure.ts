import type { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

let ignoreCodes = [
	2304, // unresolved vars
	2451, // redeclared block scope vars
	2552, // undef
];

let configure = (e: editor.IStandaloneDiffEditor, m: Monaco) => {
	m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		diagnosticCodesToIgnore: ignoreCodes,
	});

	let editor = e.getModifiedEditor();
	let model = editor.getModel();

	let path = model?.uri.path;
	let lang = model?.getLanguageId();

	if (lang === 'typescript' && path?.endsWith('.tsx')) {
		m.languages.typescript.typescriptDefaults.setCompilerOptions({
			jsx: m.languages.typescript.JsxEmit.React,
		});
	}
};

export default configure;
