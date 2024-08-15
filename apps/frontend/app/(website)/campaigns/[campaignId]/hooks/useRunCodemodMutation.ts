import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useState } from "react";
import { useMutation } from "react-query";

// @TODO
type CodemodRunResponse = {
  codemodRunIds: Array<{ id: string; codemod: string }>;
};

type CodemodRunRequest = {
  codemods: string[];
  repos: string[];
};

export const useRunCodemodMutation = () => {
  const [executionIds, setExecutionIds] = useState<
    CodemodRunResponse["codemodRunIds"]
  >([]);

  const { post: runCodemod } = useAPI<CodemodRunResponse>(RUN_CODEMOD_URL);

  const runCodemodMutation = useMutation({
    mutationFn: async (
      request: CodemodRunRequest,
    ): Promise<CodemodRunResponse> => {
      const result = await runCodemod(request);

      setExecutionIds(result.data.codemodRunIds);

      return result.data;
    },
  });

  return { executionIds, runCodemodMutation };
};
