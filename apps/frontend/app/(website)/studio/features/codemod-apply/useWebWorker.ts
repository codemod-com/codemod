import type { KnownEngines } from "@codemod-com/utilities";
import type { Event } from "@studio/schemata/eventSchemata";
import {
  type WebWorkerIncomingMessage,
  parseWebWorkerOutgoingMessage,
} from "@studio/schemata/webWorkersSchemata";
import { useCallback, useEffect, useRef, useState } from "react";

type State =
  | {
      readonly kind: "LEFT";
      readonly error: Error;
    }
  | {
      readonly kind: "RIGHT";
      readonly events: ReadonlyArray<Event>;
      readonly output: string | null | undefined;
    };

export let useWebWorker = () => {
  let [state, setState] = useState<State>({
    kind: "RIGHT",
    events: [],
    output: undefined,
  });

  let ref = useRef<Worker | null>(null);

  let postMessage = useCallback(
    (engine: KnownEngines, content: string, input: string) => {
      ref.current?.postMessage({
        engine: String(engine),
        content: String(content),
        input: String(input),
      } satisfies WebWorkerIncomingMessage);
    },
    [],
  );

  let [retry, setRetry] = useState<() => ReturnType<typeof postMessage>>();

  let [count, setCount] = useState(3);

  useEffect(() => {
    let worker = new Worker(new URL("./webworker.ts", import.meta.url), {
      type: "module",
      credentials: "omit",
    });

    worker.onmessageerror = () => {
      setState({
        kind: "LEFT",
        error: new Error("Could not deserialize a worker message"),
      });
    };

    worker.onmessage = (messageEvent) => {
      let data = parseWebWorkerOutgoingMessage(messageEvent.data);
      setCount(3);
      setState({
        kind: "RIGHT",
        ...data,
      });
    };

    worker.onerror = (ee) => {
      let error =
        ee.error instanceof Error
          ? ee.error
          : new Error("Unknown worker error");

      if (count) {
        retry?.();
      }
      setCount((c) => c - 1);
      setState({
        kind: "LEFT",
        error,
      });
    };

    ref.current = worker;

    return () => {
      worker.terminate();
    };
  }, []);

  return [state, postMessage, setRetry] as const;
};
