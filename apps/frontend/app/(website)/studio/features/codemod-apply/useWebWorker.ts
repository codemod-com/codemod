import type { KnownEngines } from "@codemod-com/utilities";
import type { Event } from "@studio/schemata/eventSchemata";
import { parseWebWorkerOutgoingMessage, type WebWorkerIncomingMessage, } from "@studio/schemata/webWorkersSchemata";
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

	const [retry, setRetry] = useState<() => ReturnType<typeof postMessage>>();

	const [count, setCount] = useState(3);

	useEffect(() => {
		const worker = new Worker(new URL("./webworker.ts", import.meta.url), {
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
			const data = parseWebWorkerOutgoingMessage(messageEvent.data);
			setCount(3);
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
