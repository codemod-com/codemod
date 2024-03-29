import { useEffect, useRef } from "react";

interface ChatScrollAnchorProps {
	trackVisibility?: boolean;
}

const ChatScrollAnchor = ({ trackVisibility }: ChatScrollAnchorProps) => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const refNode = ref.current;
		if (refNode === null) {
			return undefined;
		}
		if (!trackVisibility) {
			return undefined;
		}
		const handleIntersection = (entries: any[]) => {
			entries.forEach((entry) => {
				if (entry.target === ref.current) {
					if (!entry.isIntersecting) {
						refNode.scrollIntoView({ block: "start" });
					}
				}
			});
		};

		const observer = new IntersectionObserver(handleIntersection);
		observer.observe(refNode);

		return () => {
			observer.disconnect();
		};
	}, [trackVisibility]);

	return <div ref={ref} className={"h-px w-full"} />;
};

ChatScrollAnchor.displayName = "ChatScrollAnchor";

export default ChatScrollAnchor;
