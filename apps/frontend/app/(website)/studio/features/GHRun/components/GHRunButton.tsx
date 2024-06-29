import { ProgressBar, useExecutionStatus } from "@features/GHRun";
import { useLocalStorage } from "@studio/hooks/useLocalStorage";

import { memo } from "react";

export const GHRunButton = memo(() => {
  const [codemodExecutionId, setCodemodExecutionId, clearExecutionId] =
    useLocalStorage("codemodExecutionId");

  const codemodRunStatus = useExecutionStatus({
    codemodExecutionId,
    clearExecutionId,
  });

  return (
    <>
      {codemodRunStatus && <ProgressBar codemodRunStatus={codemodRunStatus} />}
    </>
  );
});

GHRunButton.displayName = "GHRunButton";
