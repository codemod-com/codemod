import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { type State } from '~/schemata/stateSchemata';
import { SEARCH_PARAMS_KEYS } from '~/store/getInitialState';
import { selectMod, setContent } from '~/store/slices/mod';
import {
	selectEngine,
	selectIndividualSnippet,
	setEngine,
	setInput,
	setOutput,
} from '~/store/slices/snippets';
import { selectActiveSnippet } from '~/store/slices/view';

export const useInputs = () => {
	const activeSnippet = useSelector(selectActiveSnippet);
	const engine = useSelector(selectEngine);
	const { internalContent } = useSelector(selectMod);
	const dispatch = useDispatch();

	const currentSnippet = useSelector(selectIndividualSnippet(activeSnippet));

	useEffect(() => {
		if (!currentSnippet) {
			return;
		}
		localStorage.setItem(
			'state',
			JSON.stringify({
				engine,
				beforeSnippet: currentSnippet.inputSnippet,
				afterSnippet: currentSnippet.outputSnippet,
				codemodSource: internalContent ?? '',
			} satisfies State),
		);
	}, [engine, internalContent, currentSnippet]);

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
				dispatch(
					setInput({
						name: activeSnippet,
						snippetContent: storageEvent.newValue ?? '',
					}),
				);
			}

			if (storageEvent.key === SEARCH_PARAMS_KEYS.BEFORE_SNIPPET) {
				dispatch(
					setOutput({
						name: activeSnippet,
						snippetContent: storageEvent.newValue ?? '',
					}),
				);
			}

			if (storageEvent.key === SEARCH_PARAMS_KEYS.CODEMOD_SOURCE) {
				dispatch(setContent(storageEvent.newValue ?? ''));
			}
		};

		window.addEventListener('storage', storageEventListener);

		return () => {
			window.removeEventListener('storage', storageEventListener);
		};
	}, [activeSnippet, dispatch]);
};
