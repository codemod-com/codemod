import { useCallback, useEffect } from 'react';

/**
 * Hook that detects when ctl/meta + some key is pressed
 */
export let useCTLKey = (key: string, callback: () => void) => {
	let keyPressCallback = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === key && (event.ctrlKey || event.metaKey)) {
				callback();
			}
		},
		[callback, key],
	);

	useEffect(() => {
		document.addEventListener('keydown', keyPressCallback);

		return () => document.removeEventListener('keydown', keyPressCallback);
	}, [keyPressCallback]);
};

/**
 * Hook that detects when some key is pressed
 */
export let useKey = (
	container: HTMLElement | null,
	key: KeyboardEvent['key'],
	callback: () => void,
) => {
	let keyDownCallback = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === key) {
				event.preventDefault();
				callback();
			}
		},
		[callback, key],
	);

	useEffect(() => {
		if (container === null) {
			return;
		}
		container.addEventListener('keydown', keyDownCallback);

		return () => {
			container.removeEventListener('keydown', keyDownCallback);
		};
	}, [keyDownCallback, container]);
};
