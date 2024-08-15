import type { GetExecutionStatusResponse } from "@codemod-com/api-types";
import { GET_EXECUTION_STATUS } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useEffect, useState } from "react";

const DEFAULT_POLLING_INTERVAL = 1000;

export const useCodemodRunResult = (
  executionIds: string[],
  pollingInterval = DEFAULT_POLLING_INTERVAL,
): { progress: any[]; error: string | null; result: string[] } => {
  const [progress, setProgress] = useState<any[] | null>([]);

  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string[]>([]);

  const { get: getExecutionStatus } = useAPI<GetExecutionStatusResponse>(
    GET_EXECUTION_STATUS(executionIds),
  );

  const onError = (errorMessage: string) => {
    setResult([]);
    setError(`Server error: ${errorMessage}`);
    setProgress(null);
  };

  const onSuccess = (result: string[]) => {
    setError(null);
    setResult(result);
    setProgress(null);
  };

  const onReset = () => {
    setError(null);
    setResult([]);
    setProgress(null);
  };

  useEffect(() => {
    if (executionIds.length === 0 || result.length !== 0) {
      return;
    }

    let intervalId: number;

    const pollCodemodRunResult = async () => {
      intervalId = window.setInterval(async () => {
        let response: GetExecutionStatusResponse | null = null;

        try {
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

        if (
          response?.result?.every(({ status }) => status === "done") &&
          response?.success
        ) {
          onSuccess(response?.result.map(({ link }) => link));
          clearInterval(intervalId);
        }
      }, pollingInterval);
    };

    console.log("rerendered");
    pollCodemodRunResult();

    return () => {
      onReset();
      clearInterval(intervalId);
    };
    // @TODO why
  }, [executionIds.join(",")]);

  return { progress, error, result };
};
