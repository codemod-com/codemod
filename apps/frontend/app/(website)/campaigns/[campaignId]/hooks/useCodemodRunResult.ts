import type { GetExecutionStatusResponse } from "@codemod-com/api-types";
import { GET_EXECUTION_STATUS } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useEffect, useState } from "react";

const DEFAULT_POLLING_INTERVAL = 1000;

export const useCodemodRunResult = (
  executionIds: string[],
  pollingInterval = DEFAULT_POLLING_INTERVAL,
): { isLoading: boolean; error: string | null; result: string | null } => {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const { get: getExecutionStatus } = useAPI<GetExecutionStatusResponse>(
    GET_EXECUTION_STATUS(executionIds),
  );

  const onError = (errorMessage: string) => {
    setResult(null);
    setError(`Server error: ${errorMessage}`);
    setIsLoading(false);
  };

  const onSuccess = (result: string) => {
    setError(null);
    setResult(result);
    setIsLoading(false);
  };

  const onReset = () => {
    setError(null);
    setResult(null);
    setIsLoading(false);
  };

  useEffect(() => {
    let intervalId: number;

    const pollCodemodRunResult = async () => {
      intervalId = window.setInterval(async () => {
        let response: GetExecutionStatusResponse | null = null;

        try {
          setIsLoading(true);
          response = (await getExecutionStatus<GetExecutionStatusResponse>())
            .data;
        } catch (e) {
          const errorMessage = e instanceof Error ? e.message : String(e);

          onError(errorMessage);
          clearInterval(intervalId);
        }

        if (response?.result?.status === "error") {
          onError(response?.result.message);
          clearInterval(intervalId);
        }

        if (response?.result?.status === "done" && response?.success) {
          onSuccess(response?.result.link);
          clearInterval(intervalId);
        }
      }, pollingInterval);
    };

    if (executionIds.length !== 0) {
      pollCodemodRunResult();
    }

    return () => {
      onReset();
      clearInterval(intervalId);
    };
  }, [executionIds]);

  return { isLoading, error, result };
};
