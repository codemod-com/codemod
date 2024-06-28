import { useWebWorker } from "@/app/(website)/studio/features/codemod-apply/useWebWorker";
import { useLogStore } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";
import { useEffect } from "react";

export const useCodemodOutputUpdate = () => {
  const [webWorkerState, postMessage] = useWebWorker();
  const { setEvents, events } = useLogStore();
  const { setHasRuntimeErrors } = useModStore();
  const { engine, getSelectedEditors } = useSnippetsStore();
  const { beforeSnippet, setOutputSnippet } = getSelectedEditors();
  const { internalContent } = useModStore();
  const snippetBeforeHasOnlyWhitespaces = !/\S/.test(beforeSnippet);
  const codemodSourceHasOnlyWhitespaces = !/\S/.test(internalContent ?? "");

  console.log("useCodemodOutputUpdate");
  useEffect(() => {
    console.log("useCodemodOutputUpdate, useEffect");
    postMessage(engine, internalContent ?? "", beforeSnippet);
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
      setHasRuntimeErrors(true);
      setEvents(webWorkerState.events);
    }

    console.log({
      "webWorkerState.error?.message": webWorkerState.error?.message,
      "webWorkerState.kind": webWorkerState.kind,
      // @ts-ignore
      "webWorkerState.output": webWorkerState.output,
      engine,
      beforeSnippet,
      internalContent,
      postMessage,
    });
  }, [
    // @ts-ignore
    webWorkerState.error?.message,
    webWorkerState.kind,
    // @ts-ignore
    webWorkerState.output,
    engine,
    beforeSnippet,
    internalContent,
    postMessage,
  ]);

  const firstCodemodExecutionErrorEvent = events.find(
    (e) => e.kind === "codemodExecutionError",
  );

  return {
    firstCodemodExecutionErrorEvent,
  };
};
