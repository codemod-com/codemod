import Tippy, { type TippyProps } from "@tippyjs/react";

type Props = TippyProps;

const CustomPopover = ({ delay = [800, 100], ...others }: Props) => {
	return (
		<Tippy
			trigger="mouseenter"
			arrow
			delay={delay}
			placement="auto"
			{...others}
		/>
	);
};

export default CustomPopover;
