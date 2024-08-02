import { buildCreateWorkflowRunUrl } from "@shared/endpoints";
import { useAPI } from "@studio/hooks/useAPI";
import { useState } from "react";

export const useCreateWorkflowRun = (workflowId: string) => {
  const { post: runWorkflow } = useAPI<any>(
    buildCreateWorkflowRunUrl(workflowId),
  );
  const [workflowRunId, setWorkflowRunId] = useState(null);

  const onWorkflowRunStart = async (request: any): Promise<void> => {
    try {
      const { workflowRunId, success } = (await runWorkflow(request)).data;
      if (!success) return;

      setWorkflowRunId(workflowRunId);
    } catch (e) {
      console.error(e);
    }
  };

  const onWorkflowRunAbort = async () => {
    //    @TODO
  };

  return {
    onWorkflowRunStart,
    onWorkflowRunAbort,
    workflowRunId,
  };
};
