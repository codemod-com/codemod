import { RUN_CODEMOD } from "@/utils/apis/endpoints";
import type {
  CodemodRunResponse,
  codemodRunBodySchema,
} from "@codemod-com/utilities";
import { useUserSession } from "@studio/store/zustand/userSession";
import { useAPI } from "./useAPI";
import { useExecutionStatus } from "./useExecutionStatus";

export const useCodemodExecution = () => {
  const { codemodExecutionId, setCodemodExecutionId } = useUserSession();

  const codemodRunStatus = useExecutionStatus(codemodExecutionId);
  const { post: runCodemod } = useAPI(RUN_CODEMOD);

  const onCodemodRun = async (request: any): Promise<void> => {
    try {
      const { codemodRunId, success } = (
        await runCodemod<CodemodRunResponse, typeof codemodRunBodySchema>(
          request,
        )
      ).data;

      if (!success) {
        return;
      }

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
    codemodRunStatus,
    codemodExecutionId,
  };
};
