import Arrows from "@/assets/icons/double-arrow.svg";
import Image from "next/image";

const degs = {
	left: 90,
	right: -90,
	up: 180,
	down: 180,
};

export const Chevrons = ({
	                         className,
	                         direction = "left",
                         }: {
	className?: string;
	direction?: "left" | "right" | "up" | "down";
}) => {
	return (
		<Image
			className={ className }
			style={ {
				cursor: "pointer",
				zoom: 0.7,
				transform: `rotate(${ degs[direction] }deg)`,
			} }
			alt="arrow"
			src={ Arrows }
		/>
	);
};
