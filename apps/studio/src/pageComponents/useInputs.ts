import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type State } from '~/schemata/stateSchemata';
import { SEARCH_PARAMS_KEYS } from '~/store/getInitialState';
import { selectMod, setContent } from '~/store/slices/mod';
import {
	selectSnippets,
	setEngine,
	setInput,
	setOutput,
} from '~/store/slices/snippets';

export const useInputs = () => {
	const { engine, inputSnippet, outputSnippet } = useSelector(selectSnippets);
	const { internalContent } = useSelector(selectMod);
	const dispatch = useDispatch();

	useEffect(() => {
		localStorage.setItem(
			'state',
			JSON.stringify({
				engine,
				beforeSnippet: inputSnippet,
				afterSnippet: outputSnippet,
				codemodSource: internalContent ?? '',
			} satisfies State),
		);
	}, [engine, inputSnippet, outputSnippet, internalContent]);

	useEffect(() => {
		const storageEventListener = (storageEvent: StorageEvent) => {
			if (storageEvent.key === SEARCH_PARAMS_KEYS.ENGINE) {
				if (
					storageEvent.newValue === 'jscodeshift' ||
					storageEvent.newValue === 'tsmorph'
				) {
					dispatch(setEngine(storageEvent.newValue));
					return;
				}

				dispatch(setEngine('jscodeshift'));
			}

			if (storageEvent.key === SEARCH_PARAMS_KEYS.AFTER_SNIPPET) {
				dispatch(setInput(storageEvent.newValue ?? ''));
			}

			if (storageEvent.key === SEARCH_PARAMS_KEYS.BEFORE_SNIPPET) {
				dispatch(setOutput(storageEvent.newValue ?? ''));
			}

			if (storageEvent.key === SEARCH_PARAMS_KEYS.CODEMOD_SOURCE) {
				dispatch(setContent(storageEvent.newValue ?? ''));
			}
		};

		window.addEventListener('storage', storageEventListener);

		return () => {
			window.removeEventListener('storage', storageEventListener);
		};
	}, [dispatch]);
};
