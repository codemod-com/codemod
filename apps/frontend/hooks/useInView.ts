import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

type IntersectionOptions = {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number;
};

const useInView = (
	options: IntersectionOptions = {},
): { inView: boolean; ref: RefObject<HTMLElement> } => {
	const [inView, setInView] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			// Update our state when observer callback fires
			setInView(entry.isIntersecting);
		}, options);

		if (ref.current) {
			observer.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				observer.unobserve(ref.current);
			}
		};
	}, [ref, options]);

	return { inView, ref };
};

export default useInView;
