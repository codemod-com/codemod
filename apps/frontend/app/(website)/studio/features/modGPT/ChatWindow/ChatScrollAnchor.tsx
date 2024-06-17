import { useEffect, useRef } from "react";

interface ChatScrollAnchorProps {
  trackVisibility?: boolean;
}

export let ChatScrollAnchor = ({
  trackVisibility,
}: ChatScrollAnchorProps) => {
  let ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let refNode = ref.current;
    if (refNode === null) {
      return undefined;
    }
    if (!trackVisibility) {
      return undefined;
    }
    let handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.target === ref.current) {
          if (!entry.isIntersecting) {
            refNode.scrollIntoView({ block: "start" });
          }
        }
      });
    };

    let observer = new IntersectionObserver(handleIntersection);
    observer.observe(refNode);

    return () => {
      observer.disconnect();
    };
  }, [trackVisibility]);

  return <div ref={ref} className={"h-px w-full"} />;
};

ChatScrollAnchor.displayName = "ChatScrollAnchor";
