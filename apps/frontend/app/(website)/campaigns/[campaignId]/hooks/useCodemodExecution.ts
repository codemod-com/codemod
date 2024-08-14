import type { CodemodRunStatus } from "@codemod-com/api-types";
import { RUN_CODEMOD as RUN_CODEMOD_URL } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useMutation } from "react-query";

export const useRunCodemodMutation = () => {
  const { post: runCodemod } = useAPI<CodemodRunStatus>(RUN_CODEMOD_URL);

  const runCodemodMutation = useMutation({
    mutationFn: runCodemod,
  });

  return runCodemodMutation;
};
