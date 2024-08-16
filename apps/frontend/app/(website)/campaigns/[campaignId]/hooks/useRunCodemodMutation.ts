import type {
  CodemodRunBody,
  CodemodRunResponse,
} from "@codemod-com/utilities";
import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useState } from "react";
import { useMutation } from "react-query";

export const useRunCodemodMutation = () => {
  const [executionIds, setExecutionIds] = useState<CodemodRunResponse["ids"]>(
    [],
  );

  const { post: runCodemod } = useAPI<CodemodRunResponse>(RUN_CODEMOD_URL);

  const runCodemodMutation = useMutation({
    mutationFn: async (
      request: CodemodRunBody,
    ): Promise<CodemodRunResponse> => {
      const result = await runCodemod(request);

      setExecutionIds(result.data.ids);

      return result.data;
    },
  });

  return { executionIds, runCodemodMutation };
};
