import type { CodemodRunRequestPayload } from "@codemod-com/api-types";
import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import type { ToVoid } from "@studio/types/transformations";

export const useCodemodExecution = ({
  codemodExecutionId,
  setCodemodExecutionId,
}: {
  codemodExecutionId: string | null;
  setCodemodExecutionId: ToVoid<string | null>;
}) => {
  const { post: runCodemod } = useAPI<{ success: boolean; ids: string[] }>(
    RUN_CODEMOD_URL,
  );

  const onCodemodRun = async (
    request: CodemodRunRequestPayload,
  ): Promise<void> => {
    try {
      const { ids, success } = (await runCodemod(request)).data;
      if (!success) return;
      setCodemodExecutionId(ids[0] ?? null);
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
