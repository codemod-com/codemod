import { getTestToken } from "@/utils";
import getExecutionStatus, {
  type GetExecutionStatusResponse,
} from "@/utils/apis/getExecutionStatus";
import { useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

export const useExecutionStatus = (
  executionId: string | null,
): GetExecutionStatusResponse | null => {
  const [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const handler = async () => {
      if (executionId === null) {
        return;
      }
      console.log("executionId: ", executionId);

      const token = await getToken();

      if (token === null) {
        return;
      }
      const intervalId = setInterval(async () => {
        const executionStatus = await getExecutionStatus({
          executionId,
          token: getTestToken(),
        });
        console.log("STATUS: ", executionStatus);

        if (executionStatus === null) {
          clearInterval(intervalId);
          return;
        }

        setExecutionStatus(executionStatus);
        if (
          !executionStatus.success ||
          executionStatus.result?.status === "done" ||
          executionStatus.result?.status === "error"
        ) {
          clearInterval(intervalId);
        }
      }, 500);
    };
    handler();
  }, [executionId, getToken]);

  return executionStatus;
};
