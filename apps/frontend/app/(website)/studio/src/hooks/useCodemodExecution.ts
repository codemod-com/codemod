import { RUN_CODEMOD } from "@/utils/apis/endpoints";
import { useUserSession } from "@studio/store/zustand/userSession";
import {
  type ExecuteCodemodRequest,
  type ExecuteCodemodResponse,
  useAPI,
} from "./useAPI";
import { useExecutionStatus } from "./useExecutionStatus";

export const useCodemodExecution = () => {
  const { codemodExecutionId, setCodemodExecutionId } = useUserSession();

  const codemodRunStatus = useExecutionStatus(codemodExecutionId);
  const { post: runCodemod } = useAPI(RUN_CODEMOD);

  const onCodemodRun = async (
    request: ExecuteCodemodRequest,
  ): Promise<void> => {
    try {
      const { codemodRunId, success } = (
        await runCodemod<ExecuteCodemodResponse, ExecuteCodemodRequest>(request)
      ).data;

      if (!success) {
        return;
      }

      setCodemodExecutionId(codemodRunId);
    } catch (e) {}
  };

  const onCodemodRunCancel = async () => {
    // @TODO add ability to cancel current run

    setCodemodExecutionId(null);
  };

  return {
    onCodemodRun,
    onCodemodRunCancel,
    codemodRunStatus,
    codemodExecutionId,
  };
};
