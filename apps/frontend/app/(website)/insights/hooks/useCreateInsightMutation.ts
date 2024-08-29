import { CREATE_INSIGHT } from "@/mocks/endpoints/insights";
import { useMutation, useQueryClient } from "react-query";
import { useAPI } from "../../studio/src/hooks/useAPI";
// @TODO
import type { Insight } from "./useInsights";

export const useCreateInsightMutation = () => {
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
