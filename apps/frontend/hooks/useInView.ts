import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";

type IntersectionOptions = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number;
};

let useInView = (
  options: IntersectionOptions = {},
): { inView: boolean; ref: RefObject<HTMLElement> } => {
  let [inView, setInView] = useState(false);
  let ref = useRef(null);

  useEffect(() => {
    let observer = new IntersectionObserver(([entry]) => {
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
