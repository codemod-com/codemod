import type { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import ButtonWithTooltip from "@studio/components/button/BottonWithTooltip";

export const GenerateTestCasesButton = ({
  handleButtonClick,
}: {
  handleButtonClick: ReturnType<typeof useCodemodAI>["autogenerateTestCases"];
}) => {
  return (
    <ButtonWithTooltip
      tooltipContent={
        <>
          Generate a new pair of before/after based on your existing code
          examples OR based on the natural language description.
        </>
      }
      variant="default"
      size="sm"
      className="bg-white text-black flex gap-1 text-xs my-0 h-8 !py-0 hover:bg-accent hover:text-black"
      onClick={handleButtonClick}
    >
      Autogenerate test cases
    </ButtonWithTooltip>
  );
};
