import type { Monaco } from "@monaco-editor/react";
import type { monaco } from "@studio/customMonaco";
import { applyExtraLibs } from "./extraLibs";
import registerPromptLang, {
  LANG_ID as PROMPT_LANG_ID,
} from "./lang/promptLang";

let ignoreCodes = [
  2304, // unresolved vars
  2451, // redeclared block scope vars
  2552, // undef
];

let configure = (m: Monaco, e: monaco.editor.IStandaloneCodeEditor) => {
  m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    diagnosticCodesToIgnore: ignoreCodes,
  });

  let model = e.getModel();

  let path = model?.uri.path;
  let lang = model?.getLanguageId();

  if (lang === "typescript") {
    m.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: m.languages.typescript.ScriptTarget.ES2020,
      ...(path?.endsWith(".tsx") && {
        jsx: m.languages.typescript.JsxEmit.React,
      }),
    });
  }

  if (!m.languages.getLanguages().some((l) => l.id === PROMPT_LANG_ID)) {
    registerPromptLang(m);
  }

  applyExtraLibs(m);
};

export default configure;
