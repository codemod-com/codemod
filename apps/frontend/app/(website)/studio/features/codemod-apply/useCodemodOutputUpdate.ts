import { useWebWorker } from "@/app/(website)/studio/features/codemod-apply/useWebWorker";
import { useLogStore } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useEffect } from "react";

export const useCodemodOutputUpdate = () => {
  const [webWorkerState, postMessage] = useWebWorker();
  const { setEvents, events } = useLogStore();
  const { setHasRuntimeErrors, content } = useModStore();
  const {
    engine,
    getSelectedEditors,
    currentContent,
    currentType,
    setSelectedPairIndex,
  } = useSnippetsStore();
  const { beforeSnippet, setOutputSnippet } = getSelectedEditors();
  const snippetBeforeHasOnlyWhitespaces = !/\S/.test(beforeSnippet);
  const codemodSourceHasOnlyWhitespaces = !/\S/.test(content ?? "");
  const consoleLogs = Array.isArray(webWorkerState.events)
    ? webWorkerState.events
        ?.filter?.((e) => e.kind === "printedMessage")
        .map?.((e) => e.message)
        .join(" ")
    : "";

  useEffect(() => {
    postMessage(engine, content ?? "", beforeSnippet);
    console.log("content", content);
    if (snippetBeforeHasOnlyWhitespaces || codemodSourceHasOnlyWhitespaces) {
      setOutputSnippet("");
      setHasRuntimeErrors(false);
      setEvents([]);
    }
    if (webWorkerState.kind === "LEFT") {
      setOutputSnippet(webWorkerState.error.message);
      setHasRuntimeErrors(true);
      setEvents([]);
    } else {
      setOutputSnippet(webWorkerState.output ?? "");
      setHasRuntimeErrors(false);
      setTimeout(() => {
        setEvents(webWorkerState.events);
      });
    }
  }, [
    consoleLogs,
    // @ts-ignore
    webWorkerState.error?.message,
    webWorkerState.kind,
    // @ts-ignore
    webWorkerState.output,
    engine,
    beforeSnippet,
    currentContent,
    currentType,
    content,
    postMessage,
    setSelectedPairIndex,
  ]);

  const firstCodemodExecutionErrorEvent = events.find(
    (e) => e.kind === "codemodExecutionError",
  );

  return {
    firstCodemodExecutionErrorEvent,
  };
};
