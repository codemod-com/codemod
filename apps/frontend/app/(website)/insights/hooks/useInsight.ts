import type { CodemodRun, Insight, Widget } from "@codemod-com/database";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";
import * as v from "valibot";

export const useInsight = (insightId: string | number) => {
  const { get: getInsight } = useAPI<
    Insight & {
      widgets: Widget[];
      codemodRuns: Pick<CodemodRun, "data" | "repoUrl" | "branch">[];
    }
  >(`/insights/${insightId}`);

  return useQuery(["insights"], async () => {
    const res = await getInsight();

    return {
      ...res.data,
      codemodRuns: res.data.codemodRuns.map((run) => {
        if (!run.data.data) {
          return run;
        }

        try {
          const parsedData = v.parse(
            v.union([
              v.record(v.string(), v.unknown()),
              v.array(v.record(v.string(), v.unknown())),
            ]),
            JSON.parse(run.data.data || "{}"),
          );

          return { ...run, data: { ...run.data, data: parsedData } };
        } catch (err) {
          if (typeof run.data.data === "string") {
            return {
              ...run,
              data: { ...run.data, data: { message: run.data.data } },
            };
          }
        }

        return run;
      }),
    };
  });
};
