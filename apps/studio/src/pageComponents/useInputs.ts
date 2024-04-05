import { useEffect } from "react";
import { type State } from "~/schemata/stateSchemata";
import { SEARCH_PARAMS_KEYS } from "~/zustand/utils/getInitialState";

import { useModStore } from "~/zustand/stores/mod";
import { useSnippetStore } from "~/zustand/stores/snippets";

export const useInputs = () => {
	const {
		engine,
		setEngine,
		setBeforeSnippetText,
		setAfterSnippetText,
		beforeSnippetText,
		afterSnippetText,
	} = useSnippetStore();
	const { internalContent, setContent } = useModStore();

	useEffect(() => {
		localStorage.setItem(
			"state",
			JSON.stringify({
				engine,
				beforeSnippet: beforeSnippetText,
				afterSnippet: afterSnippetText,
				codemodSource: internalContent ?? "",
			} satisfies State),
		);
	}, [engine, beforeSnippetText, afterSnippetText, internalContent]);

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

			if (storageEvent.key === SEARCH_PARAMS_KEYS.AFTER_SNIPPET) {
				setBeforeSnippetText(storageEvent.newValue ?? "");
			}

			if (storageEvent.key === SEARCH_PARAMS_KEYS.BEFORE_SNIPPET) {
				setAfterSnippetText(storageEvent.newValue ?? "");
			}

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
