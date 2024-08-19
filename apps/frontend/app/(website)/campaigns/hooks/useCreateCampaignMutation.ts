import { CREATE_CAMPAIGN } from "@/mocks/endpoints/campaigns";
import { useMutation, useQueryClient } from "react-query";
import { useAPI } from "../../studio/src/hooks/useAPI";
// @TODO
import type { Campaign } from "./useCampaigns";

export const useCreateCampaignMutation = () => {
  const queryClient = useQueryClient();

  const { post: createCampaign } = useAPI<Campaign>(CREATE_CAMPAIGN);
  return useMutation({
    mutationFn: createCampaign,
    onSuccess: (data) => {
      queryClient.setQueryData<Campaign[]>(["campaigns"], (old) => {
        return [...(old ?? []), data.data];
      });
    },
  });
};
