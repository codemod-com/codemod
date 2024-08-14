import type { CodemodRunStatus } from "@codemod-com/api-types";
import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useState } from "react";
import { useMutation } from "react-query";

export const useRunCodemodMutation = () => {
  const [executionIds, setExecutionIds] = useState<string[]>([]);
  const { post: runCodemod } = useAPI<CodemodRunStatus>(RUN_CODEMOD_URL);

  const runCodemodMutation = useMutation({
    mutationFn: async (request) => {
      const result = await runCodemod(request);

      // @TODO
      setExecutionIds([result.data.codemodRunId]);
    },
  });

  return { executionIds, runCodemodMutation };
};
