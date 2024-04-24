import { useAuth } from "@clerk/clerk-react";
import getExecutionStatus, {
  type GetExecutionStatusResponse,
} from "@studio/api/getExecutionStatus";
import { useEffect, useState } from "react";

export const useExecutionStatus = (
  executionId: string,
): GetExecutionStatusResponse | null => {
  const [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  const { getToken } = useAuth();

  useEffect(() => {
    const handler = async () => {
      if (!executionId) {
        return;
      }

      const token = await getToken();

      if (token === null) {
        return;
      }

      const executionStatusOrError = await getExecutionStatus({
        executionId,
        token,
      });

      if (executionStatusOrError.isLeft()) {
        console.error(executionStatusOrError.getLeft());
      } else {
        setExecutionStatus(executionStatusOrError.get());
      }
    };
    handler();
  }, [executionId, getToken]);

  return executionStatus;
};
