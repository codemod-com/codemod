import { useEffect, useState } from 'react';
/**
 * watch for a change in body [data-vscode-theme-kind] attribute and update the theme
 */

import { detectBaseTheme } from './detectTheme';

export let useTheme = () => {
	let [theme, setTheme] = useState(detectBaseTheme());
	useEffect(() => {
		let observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (
					mutation.type === 'attributes' &&
					mutation.attributeName === 'data-vscode-theme-kind'
				) {
					setTheme(detectBaseTheme());
				}
			});
		});

		observer.observe(document.body, {
			attributes: true,
		});

		return () => {
			observer.disconnect();
		};
	}, []);

	return theme;
};
