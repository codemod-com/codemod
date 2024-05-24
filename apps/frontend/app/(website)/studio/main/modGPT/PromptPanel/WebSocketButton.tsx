import type { useAiService } from "@chatbot/useAiService";
import type { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import { Button } from "@studio/components/ui/button";

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
    <Button
      size="sm"
      className="group my-0 h-8 whitespace-nowrap !py-0 text-xs font-bold bg-accent"
      onClick={handleButtonClick}
      disabled={!isLoading}
    >
      Generate codemod with AI
    </Button>
  );
};
