import apiClient from "@/utils/apis/client";
import type { AxiosError } from "axios";
import { GET_EXECUTION_STATUS } from "./endpoints";

type GetExecutionStatusResponse = Readonly<{
  // status: "progress" | "done" | "idle";
  // statusMessage: string; // "waiting for execution to start" | "fetching repo" | "processing files: 100/1000"
  // progressInfo: { processed: number; total: number } | null;
  result: { status: string; message: string; link?: string } | null; // link to Github branch / PR created by the execution
  success: boolean;
}>;

type GetExecutionStatusRequest = Readonly<{
  token: string;
  executionId: string;
}>;

const getExecutionStatus = async ({
  executionId,
  token,
}: GetExecutionStatusRequest): Promise<GetExecutionStatusResponse | null> => {
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
