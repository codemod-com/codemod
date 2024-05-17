import { RUN_CODEMOD } from "@/utils/apis/endpoints";
import type {
  CodemodRunResponse,
  codemodRunBodySchema,
} from "@codemod-com/utilities";
import { useUserSession } from "@studio/store/zustand/userSession";
import { useAPI } from "./useAPI";

export let useCodemodExecution = () => {
  let { codemodExecutionId, setCodemodExecutionId } = useUserSession();

  let { post: runCodemod } = useAPI(RUN_CODEMOD);

  let onCodemodRun = async (request: any): Promise<void> => {
    try {
      let { codemodRunId, success } = (
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
