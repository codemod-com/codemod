import { cn } from "@/utils";
import { Button } from "@studio/components/ui/button";
import { useAiService } from "@studio/hooks/useAiService";
import { DownloadIcon } from "@studio/icons/Download";
import type { PropsWithChildren } from "react";

const InternalButton = ({
  children,
  onClick,
  disabled = false,
}: PropsWithChildren<{ onClick: VoidFunction; disabled?: boolean }>) => (
  <Button
    size="xs"
    variant="destructive"
    className="flex items-center justify-center"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </Button>
);

export const AiButton = () => {
  const { messageHistory, applyCodemod, wsStatus, sendSnippets, startOver } =
    useAiService();
  const status = (
    <div>
      <div>
        Status{" "}
        <strong className={cn(wsStatus === "error", "text-red-700")}>
          {wsStatus}
        </strong>
      </div>
    </div>
  );
  const header =
    wsStatus === "finished" ? (
      <InternalButton onClick={startOver}> Start over</InternalButton>
    ) : (
      <div>
        Build codemod automatically from before/after
        <InternalButton
          disabled={wsStatus === "in-progress"}
          onClick={sendSnippets}
        >
          Start
        </InternalButton>
      </div>
    );

  const history = messageHistory.map((item) => (
    <div key={item.message} className="pt-5">
      <p>
        <strong>execution status:</strong> {item.execution_status}
      </p>
      <p>
        <strong>message: </strong>
        {item.message}
      </p>
    </div>
  ));

  const applyCodemodButton = wsStatus === "finished" && (
    <div>
      <InternalButton onClick={applyCodemod}>Apply codemod</InternalButton>
    </div>
  );

  return (
    <>
      {status}
      {header}
      {history}
      {applyCodemodButton}
    </>
  );
};
