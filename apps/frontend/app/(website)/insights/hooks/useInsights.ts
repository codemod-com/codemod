import { GET_ALL_INSIGHTS } from "@/mocks/endpoints/insights";
import type { Insight } from "@codemod-com/database";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

export const useInsights = () => {
  const { get: getInsights } = useAPI<{ data: Insight[]; total: number }>(
    GET_ALL_INSIGHTS,
  );

  return useQuery(["insights"], async () => {
    const res = await getInsights();

    return res.data;
  });
};
