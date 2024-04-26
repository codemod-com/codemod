import Button from "@studio/components/button";
import { useAiService } from "@studio/hooks/useAiService";

export const AiButton = () => {
  // const showButton = localStorage.getItem('experimental_ai') || false;
  const { message, wsStatus, executionStatus, sendSnippets } = useAiService();

  return (
    <>
      <Button
        className="w-[300px]"
        color="primary"
        variant={"ghost"}
        disabled={false}
        onClick={sendSnippets}
      >
        AI service
      </Button>
      <p>execution status: {executionStatus}</p>
      <p>ws status: {wsStatus}</p>
    </>
  );
};
