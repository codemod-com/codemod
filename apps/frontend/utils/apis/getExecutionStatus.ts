import apiClient from "@/utils/apis/client";
import { GET_EXECUTION_STATUS } from "@shared/endpoints";
import type { AxiosError } from "axios";

export type Result =
  | {
      status: "progress" | "error";
      message: string; // internal events (crating folders, cloning repo, creating pull request etc..) | error messages
    }
  | {
      status: "executing codemod";
      progress: { processed: number; total: number };
    }
  | {
      status: "done";
      link: string; // PR Link
    };

type GetExecutionStatusResponse = Readonly<{
  result: Result | null;
  success: boolean;
}>;

type GetExecutionStatusRequest = Readonly<{
  token?: string | null;
  executionId?: string | null;
}>;

const getExecutionStatus = async ({
  executionId,
  token,
}: GetExecutionStatusRequest): Promise<GetExecutionStatusResponse | null> => {
  if (!token || !executionId) return null;
  try {
    const res = await apiClient.get<GetExecutionStatusResponse>(
      GET_EXECUTION_STATUS(executionId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return res.data ?? null;
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    console.error(err.response?.data.message ?? err.message);
    return null;
  }
};

export type { GetExecutionStatusRequest, GetExecutionStatusResponse };
export default getExecutionStatus;
