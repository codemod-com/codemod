import { useEffect } from "react";
import { type State } from "~/schemata/stateSchemata";
import { SEARCH_PARAMS_KEYS } from "~/store/getInitialState";
import { useFilesStore } from "~/store/zustand/file";

import { useModStore } from "~/store/zustand/mod";
import { useSnippetStore } from "~/store/zustand/snippets";

export const useInputs = () => {
	const { engine, setEngine } = useSnippetStore();
	const { internalContent, setContent } = useModStore();

	const { selectAll } = useFilesStore();

	const files = selectAll();

	useEffect(() => {
		localStorage.setItem(
			"state",
			JSON.stringify({
				engine,
				codemodSource: internalContent ?? "",
				files,
			} satisfies State),
		);
	}, [engine, files, internalContent]);

	useEffect(() => {
		const storageEventListener = (storageEvent: StorageEvent) => {
			if (storageEvent.key === SEARCH_PARAMS_KEYS.ENGINE) {
				if (
					storageEvent.newValue === "jscodeshift" ||
					storageEvent.newValue === "tsmorph"
				) {
					setEngine(storageEvent.newValue);
					return;
				}

				setEngine("jscodeshift");
			}

			//   if (storageEvent.key === SEARCH_PARAMS_KEYS.AFTER_SNIPPET) {
			//     setInput(storageEvent.newValue ?? "");
			//   }

			//   if (storageEvent.key === SEARCH_PARAMS_KEYS.BEFORE_SNIPPET) {
			//     setOutput(storageEvent.newValue ?? "");
			//   }

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
