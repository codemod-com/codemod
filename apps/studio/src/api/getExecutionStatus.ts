import { type AxiosError } from "axios";
import { GET_EXECUTION_STATUS } from "../constants";
import { Either } from "../utils/Either";
import apiClient from "./client";

type GetExecutionStatusResponse =
	| Readonly<{
			status: "idle";
			statusMessage: string;
	  }>
	| Readonly<{
			status: "progress";
			progressInfo: { processed: number; total: number };
	  }>
	| Readonly<{
			status: "done";
			statusMessage: string;
			result: { link: string };
	  }>;

type GetExecutionStatusRequest = Readonly<{
	token: string;
	executionId: string;
}>;

const getExecutionStatus = async ({
	executionId,
	token,
}: GetExecutionStatusRequest): Promise<
	Either<Error, GetExecutionStatusResponse>
> => {
	try {
		const res = await apiClient.post<GetExecutionStatusResponse>(
			GET_EXECUTION_STATUS,
			{
				executionId,
			},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		);

		return Either.right(res.data);
	} catch (e) {
		const err = e as AxiosError<{ message?: string }>;
		return Either.left(new Error(err.response?.data.message ?? err.message));
	}
};

export type { GetExecutionStatusRequest, GetExecutionStatusResponse };
export default getExecutionStatus;
