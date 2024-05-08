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

      const token = await getToken();

      if (token === null) {
        return;
      }

      const executionStatus = await getExecutionStatus({
        executionId,
        token,
      });
      if (executionStatus === null) {
        return;
      }

      setExecutionStatus(executionStatus);
    };
    handler();
  }, [executionId, getToken]);

  return executionStatus;
};
