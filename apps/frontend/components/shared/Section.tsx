import classnames from "classnames";
import type React from "react";
type Props = {
	children: React.ReactNode;
	className?: string;
	fullWidth?: boolean;
};

const Section = (props: Props) => {
	return (
		<section
			className={classnames(
				{
					"px-6 lg:px-16": !props.fullWidth,
				},
				props.className,
			)}
		>
			{props.children}
		</section>
	);
};

export default Section;
