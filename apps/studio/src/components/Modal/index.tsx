import type { FC, ReactNode } from "react";
import { cn } from "~/lib/utils";

type ModalProps = Readonly<{
	children?: ReactNode;
	onClose(): void;
	// pass in a tailwind width class like `w-1/2` or `w-9/12`
	width?: `w-${number}/${number}` | "w-full";
	height?: `h-${number}/${number}` | "h-full";
	centered: boolean;
	transparent: boolean;
}>;

const Modal = ({
	children,
	onClose,
	width,
	height,
	centered,
	transparent,
}: ModalProps) => {
	const upperDivClassName = cn(
		"overflow-x-hidden flex overflow-y-auto fixed inset-0 z-[10000] outline-none focus:outline-none",
		centered && "justify-center",
		"items-center",
		transparent && [width ?? "w-auto"],
		!transparent && "bg-black bg-opacity-60",
	);

	const lowerDivClassName = cn(
		{
			[width ?? "w-auto"]: !transparent,
		},
		{
			"w-full": transparent,
		},
		{
			[height ?? "h-auto my-2"]: !transparent,
		},
		{
			"h-full": transparent,
		},
		{
			"mx-auto": centered,
		},
		"relative",
		"rounded",
		"bg-gray-bg-light",
		"dark:bg-gray-darker",
	);

	return (
		<div className={upperDivClassName} onClick={onClose}>
			<div className={lowerDivClassName} onClick={(e) => e.stopPropagation()}>
				<div className="relative flex h-full w-full flex-col rounded-lg border-0 shadow-lg outline-none focus:outline-none">
					{children}
				</div>
			</div>
		</div>
	);
};

Modal.Header = (({ children }) => (
	<div className="flex items-start justify-between rounded-t bg-gray-bg-light p-2 dark:bg-gray-darker">
		{children}
	</div>
)) as FC<Pick<ModalProps, "children">>;
Modal.Header.displayName = "ModalHeader";

Modal.Body = (({ children }: Pick<ModalProps, "children">) => (
	<div className="bg-bg-gray-light relative flex-auto overflow-y-auto p-2 dark:bg-gray-darker">
		{children}
	</div>
)) as FC<Pick<ModalProps, "children">>;
Modal.Body.displayName = "ModalBody";

export default Modal;
