import { RUN_CODEMOD } from "@shared/endpoints";
import type { CodemodRunRequest, CodemodRunStatus } from "@shared/types";
import { useAPI } from "@studio/hooks/useAPI";
import type { ToVoid } from "@studio/types/transformations";

export let useCodemodExecution = ({
  codemodExecutionId,
  setCodemodExecutionId,
}: {
  codemodExecutionId: string | null;
  setCodemodExecutionId: ToVoid<string | null>;
}) => {
  let { post: runCodemod } = useAPI<CodemodRunStatus>(RUN_CODEMOD);

  let onCodemodRun = async (request: CodemodRunRequest): Promise<void> => {
    try {
      let { codemodRunId, success } = (await runCodemod(request)).data;
      if (!success) return;
      setCodemodExecutionId(codemodRunId);
    } catch (e) {
      console.error(e);
    }
  };

  let onCodemodRunCancel = async () => {
    // @TODO add ability to cancel current run

    setCodemodExecutionId(null);
  };

  return {
    onCodemodRun,
    onCodemodRunCancel,
    codemodExecutionId,
  };
};
