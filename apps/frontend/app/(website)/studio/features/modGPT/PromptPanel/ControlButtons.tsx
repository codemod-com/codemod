import { cn } from "@/utils";
import { MagicWand, Stop as StopIcon } from "@phosphor-icons/react";
import { Button } from "@studio/components/ui/button";

type ControlButtonsProps = {
	isLoading: boolean;
	stop: () => void;
	expandedHelper: boolean;
	toggleHelper: () => void;
};

export const ControlButtons: React.FC<ControlButtonsProps> = ({
	                                                              isLoading,
	                                                              stop,
	                                                              expandedHelper,
	                                                              toggleHelper,
                                                              }) => (
	<div className="flex h-10 items-center justify-center m-2">
		{ isLoading && (
			<Button variant="outline" onClick={ stop } className="bg-background">
				<StopIcon className="mr-2"/>
				Stop generating
			</Button>
		) }
		<Button
			variant="outline"
			size="icon"
			title={
				expandedHelper
					? "Hide recommended prompts & aliases"
					: "Show recommended prompts & aliases"
			}
			onClick={ toggleHelper }
			className={ cn(
				"absolute right-[-65px] top-[10px]",
				expandedHelper && "bg-accent",
			) }
		>
			<MagicWand/>
		</Button>
	</div>
);
