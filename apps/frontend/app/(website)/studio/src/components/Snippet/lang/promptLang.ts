import type { Monaco } from "@monaco-editor/react";
import { monaco } from "@studio/customMonaco";

let LANG_ID = "promptLang";
let tokens = [
  "BEFORE",
  "AFTER",
  "CODEMOD",
  "HIGHLIGHTED_IN_BEFORE",
  "HIGHLIGHTED_IN_AFTER",
];

let getAutocompleteOptions = (
  model: monaco.editor.ITextModel,
  token: monaco.Position,
): monaco.languages.CompletionItem[] => {
  let wordAtPosition = model.getWordAtPosition(token);
  if (!wordAtPosition) {
    return [];
  }

  let range = new monaco.Range(
    token.lineNumber,
    wordAtPosition.startColumn,
    token.lineNumber,
    wordAtPosition.endColumn,
  );

  // @TODO figure out why it does not work when keyword start from "$"
  return tokens.map((t) => ({
    range,
    label: t,
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: `$${t}`,
  }));
};

let register = (m: Monaco) => {
  m.languages.register({
    id: LANG_ID,
  });

  m.languages.registerCompletionItemProvider(LANG_ID, {
    provideCompletionItems(model, token) {
      return { suggestions: getAutocompleteOptions(model, token) };
    },
    // triggerCharacters: ['\\$'],
  });
};

export { LANG_ID, getAutocompleteOptions };
export default register;
