/**
 * Subscribes to workflow run (now pings, later ws)
 */

import { useAuth } from "@clerk/nextjs";
import { buildGetWorkflowRunUrl } from "@mocks/endpoints/gh-run";
import { useEffect, useState } from "react";
import { useAPI } from "../../studio/src/hooks/useAPI";

type WorkflowRun = {
  message: string;
  name: string;
  state: "queued" | "errored" | "in_progress" | "done";
  artifactsUrl: string | null;
};

const POLLING_INTERVAL = 2 * 1000;

export const useWorkflowRun = (workflowRunId: string): WorkflowRun | null => {
  const [workflowRunStatus, setWorkflowRun] = useState<WorkflowRun | null>(
    null,
  );

  const { getToken } = useAuth();
  const { get: getWorkflowRun } = useAPI<WorkflowRun>(
    buildGetWorkflowRunUrl(workflowRunId),
  );

  useEffect(() => {
    if (workflowRunId === "") {
      return;
    }

    let _intervalId: number;

    const pollWorkflowRunStatus = async () => {
      _intervalId = window.setInterval(async () => {
        // const token = await getToken();

        const token = "123";

        if (token === null) {
          return clearInterval(_intervalId);
        }

        try {
          const response = (await getWorkflowRun<WorkflowRun>()).data;

          const isWorkflowRunFinalized = (workflowRunResult: WorkflowRun) =>
            workflowRunResult?.state === "errored" ||
            workflowRunResult?.state === "done";

          if (isWorkflowRunFinalized(response)) {
            clearInterval(_intervalId);
          }

          setWorkflowRun(response);
        } catch (e) {
          let error: string;
          try {
            error = JSON.stringify(e);
          } catch {
            error = String(e);
          }
          setWorkflowRun(null);
        }
      }, POLLING_INTERVAL);
    };

    if (workflowRunId) pollWorkflowRunStatus();

    return () => {
      setWorkflowRun(null);
      clearInterval(_intervalId);
    };
  }, [workflowRunId]);

  return workflowRunStatus;
};
