import { cn } from "@/utils";
import { Button } from "@studio/components/ui/button";
import { useAiService } from "@studio/hooks/useAiService";
import type { PropsWithChildren } from "react";

let InternalButton = ({
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

let statusColors = {
  error: "text-red-700",
  closed: "text-red-700",
  "in-progress": "text-blue-600",
  ready: "text-green-700",
  finished: "text-blue-600",
};
export let CodemodBuilder = () => {
  let {
    messageHistory,
    applyCodemod,
    codemod,
    wsStatus,
    sendSnippets,
    startOver,
  } = useAiService();
  let statusColor = wsStatus ? statusColors[wsStatus] : "";
  let status = (
    <div>
      <div>
        Status <strong className={cn(statusColor)}>{wsStatus}</strong>
      </div>
    </div>
  );
  let header =
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

  let history = messageHistory.map((item, i) => (
    <div key={item.message + i} className="pt-5">
      <p>
        <strong>action log: </strong>
        {item.message}
      </p>
    </div>
  ));

  let applyCodemodButton = codemod && (
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
