import { type MouseEventHandler, type ReactNode, useState } from "react";
import Button, { type ButtonProps } from ".";

type ButtonWithOnClickTextChangeProps = {
	clickedText: ReactNode;
	textChangeDuration: number;
} & ButtonProps;

const ButtonWithOnClickTextChange = ({
	children,
	clickedText,
	textChangeDuration,
	onClick,
	...rest
}: ButtonWithOnClickTextChangeProps) => {
	const [text, setText] = useState(children);
	const onButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
		const returnVal = onClick?.(event);
		Promise.resolve(returnVal)
			.then(() => {
				setText(clickedText);
				setTimeout(() => {
					setText(children);
				}, textChangeDuration);
			})
			.catch((err) => {
				console.error(err);
			});
	};

	return (
		<Button {...rest} onClick={onButtonClick}>
			{text}
		</Button>
	);
};

export default ButtonWithOnClickTextChange;
