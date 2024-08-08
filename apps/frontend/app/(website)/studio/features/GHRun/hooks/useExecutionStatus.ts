import { useAuth } from "@/app/auth/useAuth";
import type { GetExecutionStatusResponse } from "@codemod-com/api-types";
import { GET_EXECUTION_STATUS } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useEffect, useState } from "react";
import { showStatusToast } from "../utils";

export const useExecutionStatus = ({
  codemodExecutionId,
  clearExecutionId,
}: {
  codemodExecutionId: string | null;
  clearExecutionId: VoidFunction;
}): GetExecutionStatusResponse | null => {
  const [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  const { getToken } = useAuth();
  const { get: getExecutionStatus } = useAPI<GetExecutionStatusResponse>(
    GET_EXECUTION_STATUS(codemodExecutionId || ""),
  );

  useEffect(() => {
    let _intervalId: number;
    const executeGhRun = async () => {
      _intervalId = window.setInterval(async () => {
        const token = await getToken();

        if ([codemodExecutionId, token].includes(null)) {
          return clearInterval(_intervalId);
        }
        let response: GetExecutionStatusResponse;
        try {
          response = (await getExecutionStatus<GetExecutionStatusResponse>())
            .data;
        } catch (e) {
          let error: string;
          try {
            error = JSON.stringify(e);
          } catch {
            error = String(e);
          }
          response = {
            result: {
              status: "error",
              message: `server error: ${error}`,
            },
            success: false,
          };
        }
        const isExecutionFinalized =
          !response?.success ||
          response?.result?.status === "done" ||
          response?.result?.status === "error";

        if (isExecutionFinalized) {
          if (response?.result) showStatusToast(response.result);
          clearInterval(_intervalId);
          clearExecutionId();
          setExecutionStatus(null);
        } else {
          setExecutionStatus(response);
        }
      }, 1000);
    };

    if (codemodExecutionId) executeGhRun();
    return () => {
      setExecutionStatus(null);
      clearInterval(_intervalId);
    };
  }, [codemodExecutionId]);

  return executionStatus;
};
