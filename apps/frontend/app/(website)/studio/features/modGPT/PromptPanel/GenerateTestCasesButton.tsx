import { cn } from "@/utils";
import type { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import { MagicWand } from "@phosphor-icons/react";
import Tooltip from "@studio/components/Tooltip/Tooltip";

export const GenerateTestCasesButton = ({
  handleButtonClick,
}: {
  handleButtonClick: ReturnType<typeof useCodemodAI>["autogenerateTestCases"];
}) => {
  return (
    <Tooltip
      trigger={
        <button
          onClick={handleButtonClick}
          className={cn(
            "cursor-pointer border-hidden align-text-top bg-transparent hover:bg-transparent p-3",
          )}
        >
          <MagicWand size={"30px"} />
        </button>
      }
      content={
        <p>
          {" "}
          Generate a new pair of before/after based on your existing code
          examples OR based on the natural language description.
        </p>
      }
    />
  );
};
