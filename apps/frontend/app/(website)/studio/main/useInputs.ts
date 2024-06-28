import type { KnownEngines } from "@codemod-com/utilities";
import type { State } from "@studio/schemata/stateSchemata";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";
import { useEffect } from "react";

import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";

export const useInputs = () => {
  const { engine, setEngine, getSelectedEditors } = useSnippetsStore();
  const { internalContent, setContent } = useModStore();
  console.log("useInputs");

  const { beforeSnippet, afterSnippet } = getSelectedEditors();

  useEffect(() => {
    localStorage.setItem(
      "state",
      JSON.stringify({
        engine,
        beforeSnippet,
        afterSnippet,
        codemodSource: internalContent ?? "",
      } satisfies State),
    );
  }, [engine, beforeSnippet, afterSnippet, internalContent]);

  useEffect(() => {
    const storageEventListener = (storageEvent: StorageEvent) => {
      if (storageEvent.key === SEARCH_PARAMS_KEYS.ENGINE) {
        setEngine(storageEvent.newValue as KnownEngines);
        return;
      }

      console.log(
        'useInputs: window.addEventListener("storage", storageEventListener);',
      );
      if (storageEvent.key === SEARCH_PARAMS_KEYS.CODEMOD_SOURCE) {
        setContent(storageEvent.newValue ?? "");
      }
    };

    window.addEventListener("storage", storageEventListener);

    return () => {
      window.removeEventListener("storage", storageEventListener);
    };
  }, [setContent, setEngine]);
};
