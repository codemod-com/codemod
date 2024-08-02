import { getWorkflowRunArtifactsUrl } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

export const useWorkflowRunArtifacts = (
  workflowRunId: string,
  enabled: boolean,
) => {
  const { get: getWorkflowRunArtifacts } = useAPI<any>(
    getWorkflowRunArtifactsUrl(workflowRunId),
  );

  return useQuery(["artifacts", workflowRunId], getWorkflowRunArtifacts, {
    enabled,
  });
};
