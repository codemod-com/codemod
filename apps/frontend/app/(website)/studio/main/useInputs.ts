import type { KnownEngines } from "@codemod-com/utilities";
import type { State } from "@studio/schemata/stateSchemata";
import { SEARCH_PARAMS_KEYS } from "@studio/store/getInitialState";
import { useEffect } from "react";

import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetsStore } from "@studio/store/zustand/snippets";

export const useInputs = () => {
  const { editors, engine, setEngine } = useSnippetsStore();
  const { internalContent, setContent } = useModStore();

  useEffect(() => {
    localStorage.setItem(
      "state",
      JSON.stringify({
        engine,
        beforeSnippet: editors[0]?.before.content ?? "",
        afterSnippet: editors[0]?.after.content ?? "",
        codemodSource: internalContent ?? "",
      } satisfies State),
    );
  }, [
    engine,
    editors[0]?.before.content,
    editors[0]?.after.content,
    internalContent,
  ]);

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
  }, [setContent, setEngine]);
};
