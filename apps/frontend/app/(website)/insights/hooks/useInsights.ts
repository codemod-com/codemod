import { GET_ALL_INSIGHTS } from "@/mocks/endpoints/insights";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

// @TODO get from api-types
export type Insight = {
  id: string;
  name: string;
  owner: string;
  updatedAt: string;
};

export const useInsights = () => {
  const { get: getInsights } = useAPI<Insight[]>(GET_ALL_INSIGHTS);

  return useQuery(["insights"], async () => {
    const res = await getInsights();

    return res.data;
  });
};
