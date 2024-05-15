import getExecutionStatus, {
  type GetExecutionStatusResponse,
} from "@/utils/apis/getExecutionStatus";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

// use global var, because we need to keep state even if this hook is rendered in multiple different components
let listeningExecutionId: string | null = null;

export const useExecutionStatus = (
  executionId: string | null,
): GetExecutionStatusResponse | null => {
  const [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    if (executionId !== null && listeningExecutionId === executionId) {
      return;
    }

    listeningExecutionId = executionId;

    let intervalId: number | null = null;

    const handler = async () => {
      if (executionId === null) {
        return;
      }

      const token = await getToken();

      if (token === null) {
        return;
      }
      intervalId = window.setInterval(async () => {
        const executionStatus = await getExecutionStatus({
          executionId,
          token,
        });
        console.log("STATUS: ", executionStatus?.result?.status);

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
      }, 500);
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
