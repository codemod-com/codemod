import { GET_ALL_CAMPAIGNS } from "@/mocks/endpoints/campaigns";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

// @TODO get from api-types
export type Campaign = {
  id: string;
  name: string;
  owner: string;
  updatedAt: string;
};

export const useCampaigns = () => {
  const { get: getCampaigns } = useAPI<Campaign[]>(GET_ALL_CAMPAIGNS);

  return useQuery(["campaigns"], async () => {
    const res = await getCampaigns();

    return res.data;
  });
};
