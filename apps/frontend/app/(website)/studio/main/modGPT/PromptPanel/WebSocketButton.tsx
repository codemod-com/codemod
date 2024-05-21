import type { useCodemodAI } from "@chatbot/useAiService/codemodAI/useCodemodAI";
import { Button } from "@studio/components/ui/button";
import React from "react";

export const WebSocketButton = ({
  handleButtonClick,
  canAddMessages,
}: {
  handleButtonClick: ReturnType<
    typeof useCodemodAI
  >["startIterativeCodemodGeneration"];
  canAddMessages: ReturnType<typeof useCodemodAI>["canAddMessages"];
}) => {
  return (
    <Button
      size="sm"
      className="group my-0 h-8 whitespace-nowrap !py-0 text-xs font-bold bg-accent"
      onClick={handleButtonClick}
      disabled={!canAddMessages}
    >
      Generate codemod with AI
    </Button>
  );
};
