import { type RefObject, useEffect, useState } from 'react';

type Size = Readonly<{
	width: number;
	height: number;
}>;
export function useElementSize<T extends HTMLElement>(ref: RefObject<T>): Size {
	let [size, setSize] = useState<Size>({ width: 0, height: 0 });

	useEffect(() => {
		let element = ref.current;

		function handleResize() {
			if (!element) {
				return;
			}
			setSize({
				width: element.offsetWidth,
				height: element.offsetHeight,
			});
		}

		if (element) {
			handleResize();
			window.addEventListener('resize', handleResize);
		}
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [ref]);

	return size;
}
