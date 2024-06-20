import { useWebWorker } from "@/app/(website)/studio/features/codemod-apply/useWebWorker";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useLogStore } from "@studio/store/zustand/log";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { useEffect } from "react";

export let useCodemodOutputUpdate = () => {
  let [webWorkerState, postMessage, setRetry] = useWebWorker();
  let codemodOutput = useCodemodOutputStore();
  let { setEvents, events } = useLogStore();
  let { setHasRuntimeErrors } = useModStore();
  let { engine, inputSnippet } = useSnippetStore();
  let { internalContent } = useModStore();
  let snippetBeforeHasOnlyWhitespaces = !/\S/.test(inputSnippet);
  let codemodSourceHasOnlyWhitespaces = !/\S/.test(internalContent ?? "");

  useEffect(() => {
    postMessage(engine, internalContent ?? "", inputSnippet);
    setRetry(() => postMessage(engine, internalContent ?? "", inputSnippet));
    if (snippetBeforeHasOnlyWhitespaces || codemodSourceHasOnlyWhitespaces) {
      codemodOutput.setContent("");
      setHasRuntimeErrors(false);
      setEvents([]);
    }
    if (webWorkerState.kind === "LEFT") {
      codemodOutput.setContent(webWorkerState.error.message);
      setHasRuntimeErrors(true);
      setEvents([]);
    } else {
      codemodOutput.setContent(webWorkerState.output ?? "");
      setHasRuntimeErrors(true);
      setEvents(webWorkerState.events);
    }
  }, [
    // @ts-ignore
    webWorkerState.error?.message,
    webWorkerState.kind,
    // @ts-ignore
    webWorkerState.output,
    engine,
    inputSnippet,
    internalContent,
    snippetBeforeHasOnlyWhitespaces,
    codemodSourceHasOnlyWhitespaces,
    postMessage,
  ]);

  let firstCodemodExecutionErrorEvent = events.find(
    (e) => e.kind === "codemodExecutionError",
  );

  return {
    firstCodemodExecutionErrorEvent,
  };
};
