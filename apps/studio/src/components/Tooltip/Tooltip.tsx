import { type ReactNode } from "react";
import {
	Tooltip as ShadcnTooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "~/components/ui/tooltip";

type Props = {
	trigger: ReactNode;
	content: string | ReactNode;
};

const Tooltip = ({ trigger, content }: Props) => (
	<TooltipProvider>
		<ShadcnTooltip>
			<TooltipTrigger asChild>{trigger}</TooltipTrigger>
			<TooltipContent>{content}</TooltipContent>
		</ShadcnTooltip>
	</TooltipProvider>
);

export default Tooltip;
