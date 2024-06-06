import { useWebWorker } from "@/app/(website)/studio/features/codemod-apply/useWebWorker";
import { useCodemodOutputStore } from "@studio/store/zustand/codemodOutput";
import { useLogStore } from "@studio/store/zustand/log";
import { useModStore } from "@studio/store/zustand/mod";
import { useSnippetStore } from "@studio/store/zustand/snippets";
import { useEffect } from "react";

export const useCodemodOutputUpdate = () => {
  const [webWorkerState, postMessage, setRetry] = useWebWorker();
  const codemodOutput = useCodemodOutputStore();
  const { setEvents, events } = useLogStore();
  const { setHasRuntimeErrors } = useModStore();
  const { engine, inputSnippet } = useSnippetStore();
  const { internalContent } = useModStore();
  const snippetBeforeHasOnlyWhitespaces = !/\S/.test(inputSnippet);
  const codemodSourceHasOnlyWhitespaces = !/\S/.test(internalContent ?? "");

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

  const firstCodemodExecutionErrorEvent = events.find(
    (e) => e.kind === "codemodExecutionError",
  );

  return {
    firstCodemodExecutionErrorEvent,
  };
};
