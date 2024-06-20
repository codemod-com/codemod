import type { KnownEngines } from "@codemod-com/utilities";
import type { State } from "@studio/schemata/stateSchemata";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";
import { useEffect } from "react";

import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";

export let useInputs = () => {
  let {
    engine,
    setEngine,
    setInput,
    setOutput,
    inputSnippet,
    outputSnippet,
  } = useSnippetStore();
  let { internalContent, setContent } = useModStore();

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
    let storageEventListener = (storageEvent: StorageEvent) => {
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
  }, [setContent, setEngine]);
};
