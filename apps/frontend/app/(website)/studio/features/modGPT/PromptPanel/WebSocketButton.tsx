import type { useAiService } from "@chatbot/useAiService";
import type { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import ButtonWithTooltip from "@studio/components/button/BottonWithTooltip";
import Link from "next/link";

export const WebSocketButton = ({
	                                handleButtonClick,
	                                isLoading,
                                }: {
	handleButtonClick: ReturnType<
		typeof useCodemodAI
	>["startIterativeCodemodGeneration"];
	isLoading: ReturnType<typeof useAiService>["isLoading"];
}) => {
	return (
		<ButtonWithTooltip
			tooltipContent={
				<>
					with selected model and Codemod’s iterative AI system.
					<Link
						style={ { color: "blue" } }
						href="https://codemod.com/blog/iterative-ai-system"
					>
						{ " " }
						Learn more
					</Link>
				</>
			}
			variant="default"
			size="sm"
			className="text-white flex gap-1 text-xs my-0 h-8 !py-0 bg-black hover:bg-accent hover:text-black"
			// className="group my-0 h-8 whitespace-nowrap !py-0 text-xs font-bold bg-primary"
			onClick={ handleButtonClick }
			disabled={ isLoading }
		>
			Autogenerate with Codemod AI (BETA)
		</ButtonWithTooltip>
	);
};
