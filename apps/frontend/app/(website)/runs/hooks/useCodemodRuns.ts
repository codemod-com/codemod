import { GET_ALL_CODEMOD_RUNS } from "@/mocks/endpoints/insights";
import type { CodemodRun } from "@codemod-com/database";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

export const useCodemodRuns = () => {
  const { get: getInsights } = useAPI<{ data: CodemodRun[]; total: number }>(
    GET_ALL_CODEMOD_RUNS,
  );

  return useQuery(["codemod-runs"], async () => {
    const res = await getInsights();

    return res.data;
  });
};
