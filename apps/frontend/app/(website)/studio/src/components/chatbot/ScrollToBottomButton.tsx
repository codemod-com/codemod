import { ArrowDown as ArrowDownIcon } from "@phosphor-icons/react";
import { Button, type ButtonProps } from "@studio/components/ui/button";
import { useScrollToBottomDetector } from "@studio/hooks/useScrollToBottomDetector";
import { cn } from "@studio/lib/utils";

const ScrollToBottomButton = ({ className, ...props }: ButtonProps) => {
	const scrollWindow =
		document.getElementsByClassName("scrollWindow")?.[0] ?? null;
	const isAtBottom = useScrollToBottomDetector(scrollWindow);

	return (
		<Button
			variant="outline"
			size="icon"
			className={cn(
				"absolute right-4 bg-background transition-opacity duration-300",
				isAtBottom ? "opacity-0" : "opacity-100",
				className,
			)}
			onClick={() =>
				scrollWindow?.scrollTo({
					top: scrollWindow?.scrollHeight,
					behavior: "smooth",
				})
			}
			{...props}
		>
			<ArrowDownIcon />
			<span className="sr-only">Scroll to bottom</span>
		</Button>
	);
};

ScrollToBottomButton.displayName = "ScrollToBottomButton";

export default ScrollToBottomButton;
