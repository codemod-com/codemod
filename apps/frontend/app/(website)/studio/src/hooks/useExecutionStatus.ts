import getExecutionStatus, {
  type GetExecutionStatusResponse,
} from "@/utils/apis/getExecutionStatus";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// use global var, because we need to keep state even if this hook is rendered in multiple different components
let listeningExecutionId: string | null = null;

export let useExecutionStatus = (
  executionId: string | null,
): GetExecutionStatusResponse | null => {
  let [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  let { getToken } = useAuth();

  useEffect(() => {
    if (executionId !== null && listeningExecutionId === executionId) {
      return;
    }

    listeningExecutionId = executionId;

    let intervalId: number | null = null;

    let handler = async () => {
      intervalId = window.setInterval(async () => {
        if (executionId === null) {
          return;
        }

        let token = await getToken();

        if (token === null) {
          return;
        }

        let executionStatus = await getExecutionStatus({
          executionId,
          token,
        });

        if (executionStatus === null) {
          if (intervalId !== null) {
            clearInterval(intervalId);
          }
          return;
        }

        setExecutionStatus(executionStatus);
        if (
          (!executionStatus.success ||
            executionStatus.result?.status === "done" ||
            executionStatus.result?.status === "error") &&
          intervalId !== null
        ) {
          clearInterval(intervalId);
        }
      }, 1000);
    };
    handler();
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [executionId, getToken]);

  return executionStatus;
};
