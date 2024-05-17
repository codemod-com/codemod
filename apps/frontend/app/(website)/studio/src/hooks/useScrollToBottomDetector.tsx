import { useEffect, useState } from "react";

export let useScrollToBottomDetector = (container: Element | null) => {
  let [isAtBottom, setIsAtBottom] = useState(false);
  useEffect(() => {
    if (container === null) {
      return undefined;
    }

    let handleScroll = () => {
      let chatPanel =
        document.getElementsByClassName("chatPanel")?.[0] ?? null;
      let scrollOffset =
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
