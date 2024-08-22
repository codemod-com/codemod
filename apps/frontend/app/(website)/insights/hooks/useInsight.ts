import type { CodemodRun, Insight, Widget } from "@codemod-com/database";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

export const useInsight = (insightId: string) => {
  const { get: getInsight } = useAPI<
    Insight & { widgets: Widget[]; codemodRuns: { data: CodemodRun["data"] } }
  >(`/insights/${insightId}`);

  return useQuery(["insights"], async () => {
    const res = await getInsight();

    return res.data;
  });
};
