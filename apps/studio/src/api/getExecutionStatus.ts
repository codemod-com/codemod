import { type AxiosError } from "axios";
import { Either } from "../utils/Either";

type GetExecutionStatusResponse = Readonly<{ message: string }> &
	(
		| Readonly<{
				status: "idle";
		  }>
		| Readonly<{
				status: "progress";
				progressInfo: { total: number; processed: number } | null;
		  }>
		| Readonly<{
				status: "done";
				result: { link: string };
		  }>
		| Readonly<{
				status: "error";
		  }>
	);

type GetExecutionStatusRequest = Readonly<{
	token: string;
	executionId: string;
}>;

let i = 0;
const codemodRunStatusResponses: GetExecutionStatusResponse[] = [
	{
		status: "progress",
		message: "Fetching repo...",
		progressInfo: null,
	},
	{
		status: "progress",
		message: "Processing files: 300/12345",
		progressInfo: { processed: 300, total: 12345 },
	},
	{
		status: "progress",
		message: "Processing files: 2500/12345",
		progressInfo: { processed: 2500, total: 12345 },
	},
	{
		status: "progress",
		message: "Processing files: 10000/12345",
		progressInfo: { processed: 10000, total: 12345 },
	},
	{
		status: "done",
		message: "",
		result: { link: "http://github.com/cal.com" },
	},
];
const getExecutionStatus = async ({
	executionId,
	token,
}: GetExecutionStatusRequest): Promise<
	Either<Error, GetExecutionStatusResponse>
> => {
	try {
		// const res = await apiClient.post<GetExecutionStatusResponse>(
		//   GET_EXECUTION_STATUS,
		//   {
		//     executionId,
		//   },
		//   {
		//     headers: {
		//       Authorization: `Bearer ${token}`,
		//     },
		//   }
		// );

		// @TODO mock
		const mockedRes = codemodRunStatusResponses[i % 5];
		i++;

		if (!mockedRes) {
			throw Error("");
		}

		return Either.right(mockedRes);
	} catch (e) {
		const err = e as AxiosError<{ message?: string }>;
		return Either.left(new Error(err.response?.data.message ?? err.message));
	}
};

export type { GetExecutionStatusRequest, GetExecutionStatusResponse };
export default getExecutionStatus;
