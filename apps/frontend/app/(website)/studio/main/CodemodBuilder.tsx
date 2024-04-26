import { cn } from "@/utils";
import { Button } from "@studio/components/ui/button";
import { useAiService } from "@studio/hooks/useAiService";
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

const statusColors = {
  error: "text-red-700",
  closed: "text-red-700",
  "in-progress": "text-blue-600",
  ready: "text-green-700",
  finished: "text-blue-600",
};
export const CodemodBuilder = () => {
  const {
    messageHistory,
    applyCodemod,
    codemod,
    wsStatus,
    sendSnippets,
    startOver,
  } = useAiService();
  const statusColor = wsStatus ? statusColors[wsStatus] : "";
  const status = (
    <div>
      <div>
        Status <strong className={cn(statusColor)}>{wsStatus}</strong>
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

  const history = messageHistory.map((item, i) => (
    <div key={item.message + i} className="pt-5">
      <p>
        <strong>action log: </strong>
        {item.message}
      </p>
    </div>
  ));

  const applyCodemodButton = codemod && (
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
