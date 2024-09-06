import { CREATE_INSIGHT } from "@/mocks/endpoints/insights";
import type { Insight } from "@codemod-com/database";
import { useMutation, useQueryClient } from "react-query";
import { useAPI } from "../../studio/src/hooks/useAPI";

export const useInitiateInsightsMutation = () => {
  const queryClient = useQueryClient();

  const { post: createInsight } = useAPI<Insight>(CREATE_INSIGHT);
  return useMutation({
    mutationFn: createInsight,
    onSuccess: (data) => {
      queryClient.setQueryData<Insight[]>(["insights"], (old) => {
        return [...(old ?? []), data.data];
      });
    },
  });
};
