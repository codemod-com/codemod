import { RefObject, useEffect, useState } from 'react';

type Size = Readonly<{
	width: number;
	height: number;
}>;
export function useElementSize<T extends HTMLElement>(ref: RefObject<T>): Size {
	const [size, setSize] = useState<Size>({ width: 0, height: 0 });

	useEffect(() => {
		const element = ref.current;

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
