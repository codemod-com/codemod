import { useAuth } from "@/app/auth/useAuth";
import getExecutionStatus, {
  type GetExecutionStatusResponse,
} from "@utils/apis/getExecutionStatus";
import { useEffect, useState } from "react";
import { showStatusToast } from "../utils";

// use global var, because we need to keep state even if this hook is rendered in multiple different components
let listeningExecutionId: string | null = null;

export const useExecutionStatus = (
  executionId: string | null,
): GetExecutionStatusResponse | null => {
  const [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  const { getToken } = useAuth();
  let intervalId = -1;
  const isExecutionFinalized =
    intervalId > -1 &&
    executionStatus &&
    (!executionStatus.success ||
      executionStatus.result?.status === "done" ||
      executionStatus.result?.status === "error");

  const executeGhRun = async () => {
    intervalId = window.setInterval(async () => {
      const token = await getToken();
      const _executionStatus = await getExecutionStatus({
        executionId,
        token,
      });

      if ([executionId, token, _executionStatus].includes(null)) {
        return clearInterval(intervalId);
      }

      setExecutionStatus(_executionStatus);

      if (isExecutionFinalized) {
        if (_executionStatus?.result) showStatusToast(_executionStatus.result);
        setExecutionStatus(null);
        clearInterval(intervalId);
      }
    }, 1000);
  };

  useEffect(() => {
    if (executionId !== null && listeningExecutionId === executionId) {
      return;
    }
    listeningExecutionId = executionId;
    executeGhRun();
    return () => {
      if (intervalId > -1) {
        setExecutionStatus(null);
        clearInterval(intervalId);
      }
    };
  }, [executionId, getToken]);

  return executionStatus;
};
