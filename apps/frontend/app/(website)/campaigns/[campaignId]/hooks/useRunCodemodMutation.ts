// import type { CodemodRunStatus } from "@codemod-com/api-types";
import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useState } from "react";
import { useMutation } from "react-query";

type CodemodRunStatus = {
  codemodRunIds: Array<{ id: string; workflow: string }>;
};

export const useRunCodemodMutation = () => {
  const [executionIds, setExecutionIds] = useState<
    { id: string; workflow: string }[]
  >([]);
  const { post: runCodemod } = useAPI<CodemodRunStatus>(RUN_CODEMOD_URL);

  const runCodemodMutation = useMutation({
    mutationFn: async (request) => {
      const result = await runCodemod(request);

      setExecutionIds(result.data.codemodRunIds);
    },
  });

  return { executionIds, runCodemodMutation };
};
