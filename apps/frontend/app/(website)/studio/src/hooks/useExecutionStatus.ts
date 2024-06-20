import { useAuth } from "@clerk/clerk-react";
import getExecutionStatus, {
  type GetExecutionStatusResponse,
} from "@studio/api/getExecutionStatus";
import { useEffect, useState } from "react";

export let useExecutionStatus = (
  executionId: string,
): GetExecutionStatusResponse | null => {
  let [executionStatus, setExecutionStatus] =
    useState<GetExecutionStatusResponse | null>(null);
  let { getToken } = useAuth();

  useEffect(() => {
    let handler = async () => {
      if (!executionId) {
        return;
      }

      let token = await getToken();

      if (token === null) {
        return;
      }

      let executionStatusOrError = await getExecutionStatus({
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
