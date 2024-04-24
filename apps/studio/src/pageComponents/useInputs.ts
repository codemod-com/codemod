import type { KnownEngines } from "@codemod-com/utilities";
import { useEffect } from "react";
import type { State } from "~/schemata/stateSchemata";
import { SEARCH_PARAMS_KEYS } from "~/store/getInitialState";

import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

export const useInputs = () => {
  const {
    engine,
    setEngine,
    setInput,
    setOutput,
    inputSnippet,
    outputSnippet,
  } = useSnippetStore();
  const { internalContent, setContent } = useModStore();

  useEffect(() => {
    localStorage.setItem(
      "state",
      JSON.stringify({
        engine,
        beforeSnippet: inputSnippet,
        afterSnippet: outputSnippet,
        codemodSource: internalContent ?? "",
      } satisfies State),
    );
  }, [engine, inputSnippet, outputSnippet, internalContent]);

  useEffect(() => {
    const storageEventListener = (storageEvent: StorageEvent) => {
      if (storageEvent.key === SEARCH_PARAMS_KEYS.ENGINE) {
        setEngine(storageEvent.newValue as KnownEngines);
        return;
      }

      if (storageEvent.key === SEARCH_PARAMS_KEYS.CODEMOD_SOURCE) {
        setContent(storageEvent.newValue ?? "");
      }
    };

    window.addEventListener("storage", storageEventListener);

    return () => {
      window.removeEventListener("storage", storageEventListener);
    };
  }, []);
};
