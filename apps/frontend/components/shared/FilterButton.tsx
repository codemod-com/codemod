import type { SanityImageWithAltField } from "@/types/object.types";
import { cva, cx } from "cva";
import type React from "react";
import Icon, { type IconName } from "./Icon";
import { SanityImage } from "./SanityImage";

type FilterButtonStyle = "default" | "active";

type FilterButton = {
	intent?: FilterButtonStyle;
	className?: string;
	icon?: IconName;
	count?: number;
	image?: {
		light?: SanityImageWithAltField;
		dark?: SanityImageWithAltField;
		alt?: string;
	};
};

type FilterButtonProps = FilterButton &
	React.ButtonHTMLAttributes<HTMLButtonElement>;

const filterButtonVariant = cva(
	[
		"relative flex py-[6px] rounded-[4px] font-medium transition-colors group disabled:text-tertiary-light disabled:bg-emphasis-light dark:disabled:text-tertiary-dark dark:disabled:bg-emphasis-dark focus:outline-none focus-visible:ring-[4px] focus-visible:ring-border-light dark:focus-visible:ring-border-dark body-s-medium",
		"text-primary-light dark:text-primary-dark",
		"gap-xs",
		"px-xs",
		"disabled:opacity-75 disabled:cursor-not-allowed",

		"transition-colors",
	],
	{
		variants: {
			intent: {
				default: [
					"bg-primary-dark dark:bg-primary-light hover:bg-emphasis-light dark:hover:bg-emphasis-dark",
				],
				active: [
					"bg-emphasis-light dark:bg-emphasis-dark hover:bg-border-light dark:hover:bg-border-dark",
				],
			},
		},
		defaultVariants: {
			intent: "default",
		},
	},
);

export default function FilterButton({
	intent = "default",
	className,
	icon,
	image,
	children,
	count,
	...props
}: FilterButtonProps) {
	return (
		<button
			className={cx(filterButtonVariant({ intent }), className)}
			{...props}
		>
			{image?.light || image?.dark ? (
				<>
					{image?.light && (
						<SanityImage
							maxWidth={20}
							image={image?.light}
							alt={image.alt}
							elProps={{
								width: 20,
								height: 20,
								className: "h-5 w-5 dark:hidden",
							}}
						/>
					)}
					{image?.dark && (
						<SanityImage
							maxWidth={20}
							image={image?.dark}
							alt={image.alt}
							elProps={{
								width: 20,
								height: 20,
								className: "hidden h-5 w-5 dark:inline",
							}}
						/>
					)}
				</>
			) : icon ? (
				<Icon
					name={icon as IconName}
					className="h-5 w-5 min-w-5 text-secondary-light dark:text-secondary-dark"
				/>
			) : null}
			{children}

			{intent === "active" ? (
				<span
					className={cx(
						"text-tertiary-light/40 dark:text-tertiary-dark/40",
						intent === "active" ? "opacity-100" : "opacity-0",
						"transition-opacity duration-200 ease-out",
					)}
					onClick={props.onClick}
				>
					<Icon className="h-5 w-5" name={"close"} />
				</span>
			) : (
				<span className="tag self-center text-secondary-light dark:text-secondary-dark">
					{count}
				</span>
			)}
		</button>
	);
}
