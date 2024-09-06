import type {
  CodemodRunBody,
  CodemodRunResponse,
} from "@codemod-com/utilities";
import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useState } from "react";
import { useMutation } from "react-query";

export const useRunCodemodMutation = () => {
  const [executionIds, setExecutionIds] = useState<string[]>([]);

  const { post: runCodemod } = useAPI<CodemodRunResponse>(RUN_CODEMOD_URL);

  const runCodemodMutation = useMutation({
    mutationFn: async (
      request: CodemodRunBody,
    ): Promise<CodemodRunResponse["data"]> => {
      const { data: result } = await runCodemod(request);

      setExecutionIds(result.data.map(({ jobId }) => jobId));

      return result.data;
    },
  });

  return { executionIds, runCodemodMutation };
};
