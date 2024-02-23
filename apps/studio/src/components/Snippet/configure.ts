import { type Monaco } from "@monaco-editor/react";
import { type monaco } from "~/customMonaco";
import { applyExtraLibs } from "./extraLibs";
import registerPromptLang, {
	LANG_ID as PROMPT_LANG_ID,
} from "./lang/promptLang";

const ignoreCodes = [
	2304, // unresolved vars
	2451, // redeclared block scope vars
	2552, // undef
];

const configure = (m: Monaco, e: monaco.editor.IStandaloneCodeEditor) => {
	m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		diagnosticCodesToIgnore: ignoreCodes,
	});

	const model = e.getModel();

	const path = model?.uri.path;
	const lang = model?.getLanguageId();

	if (lang === "typescript" && path?.endsWith(".tsx")) {
		m.languages.typescript.typescriptDefaults.setCompilerOptions({
			jsx: m.languages.typescript.JsxEmit.React,
		});
	}

	if (!m.languages.getLanguages().some((l) => l.id === PROMPT_LANG_ID)) {
		registerPromptLang(m);
	}

	applyExtraLibs(m);
};

export default configure;
