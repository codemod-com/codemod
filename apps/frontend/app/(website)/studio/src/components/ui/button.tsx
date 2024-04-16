import { Slot } from "@radix-ui/react-slot";
import Tooltip from "@studio/components/Tooltip/Tooltip";
import { cn } from "@studio/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import * as React from "react";

const buttonVariants = cva(
	"inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				destructive:
					"bg-destructive text-destructive-foreground hover:bg-destructive/90",
				outline:
					"border border-input bg-background hover:bg-accent hover:text-accent-foreground",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				link: "text-primary underline-offset-4 hover:underline",
				unstyled: "",
			},
			size: {
				unstyled: "h-auto w-auto",
				default: "h-10 px-4 py-2",
				sm: "h-9 rounded-md px-3",
				xs: "h-7 rounded-md px-2",
				lg: "h-11 rounded-md px-8",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	isLoading?: boolean;
	asChild?: boolean;
	hint?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ className, variant, size, isLoading, hint, asChild = false, ...props },
		ref,
	) => {
		const RenderElement = asChild ? Slot : "button";
		if (isLoading) {
			props.children = [
				<Loader2
					key="loading-indicator"
					className="mr-2 h-4 w-4 animate-spin"
				/>,
				...React.Children.toArray(props.children),
			];
		}

		const Comp = (
			<RenderElement
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				disabled={isLoading}
				{...props}
			/>
		);

		if (hint) {
			return <Tooltip trigger={Comp} content={hint} />;
		}

		return Comp;
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
