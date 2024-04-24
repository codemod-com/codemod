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

export const useWebWorker = () => {
  const [state, setState] = useState<State>({
    kind: "RIGHT",
    events: [],
    output: undefined,
  });

  const ref = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("../utils/webworker.ts", import.meta.url),
      {
        type: "module",
        credentials: "omit",
      },
    );

    worker.onmessageerror = () => {
      setState({
        kind: "LEFT",
        error: new Error("Could not deserialize a worker message"),
      });
    };

    worker.onmessage = (messageEvent) => {
      const data = parseWebWorkerOutgoingMessage(messageEvent.data);

      setState({
        kind: "RIGHT",
        ...data,
      });
    };

    worker.onerror = (ee) => {
      const error =
        ee.error instanceof Error
          ? ee.error
          : new Error("Unknown worker error");

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

  const postMessage = useCallback(
    (engine: KnownEngines, content: string, input: string) => {
      ref.current?.postMessage({
        engine: String(engine),
        content: String(content),
        input: String(input),
      } satisfies WebWorkerIncomingMessage);
    },
    [],
  );

  return [state, postMessage] as const;
};
