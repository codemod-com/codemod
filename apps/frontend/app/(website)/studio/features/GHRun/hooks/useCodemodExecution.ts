import { RUN_CODEMOD } from "@shared/endpoints";
import type { CodemodRunRequest, CodemodRunStatus } from "@shared/types";
import { useAPI } from "@studio/hooks/useAPI";
import type { ToVoid } from "@studio/types/transformations";

export const useCodemodExecution = ({
  codemodExecutionId,
  setCodemodExecutionId,
}: {
  codemodExecutionId: string | null;
  setCodemodExecutionId: ToVoid<string | null>;
}) => {
  const { post: runCodemod } = useAPI<CodemodRunStatus>(RUN_CODEMOD);

  const onCodemodRun = async (request: CodemodRunRequest): Promise<void> => {
    try {
      const { codemodRunId, success } = (await runCodemod(request)).data;
      if (!success) return;
      setCodemodExecutionId(codemodRunId);
    } catch (e) {
      console.error(e);
    }
  };

  const onCodemodRunCancel = async () => {
    // @TODO add ability to cancel current run

    setCodemodExecutionId(null);
  };

  return {
    onCodemodRun,
    onCodemodRunCancel,
    codemodExecutionId,
  };
};
