import { useEffect, useState } from "react";

export const useScrollToBottomDetector = (container: Element | null) => {
	const [isAtBottom, setIsAtBottom] = useState(false);
	useEffect(() => {
		if (container === null) {
			return undefined;
		}

		const handleScroll = () => {
			const chatPanel =
				document.getElementsByClassName("chatPanel")?.[0] ?? null;
			const scrollOffset =
				container.scrollHeight -
				container.clientHeight -
				(chatPanel?.clientHeight ?? 0);

			setIsAtBottom(container.scrollTop >= scrollOffset);
		};

		container.addEventListener("scroll", handleScroll, {
			passive: true,
		});
		handleScroll();

		return () => {
			container.removeEventListener("scroll", handleScroll);
		};
	}, [container]);

	return isAtBottom;
};
