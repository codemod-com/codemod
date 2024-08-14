import { GET_ALL_CAMPAIGNS } from "@/mocks/endpoints/campaigns";
import type { Campaign } from "@codemod-com/api-types";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

export const useCampaigns = () => {
  const { get: getCampaigns } = useAPI<Campaign[]>(GET_ALL_CAMPAIGNS);

  return useQuery(["campaigns"], getCampaigns);
};
