import { type AxiosError } from "axios";
import { BUILD_ACCESS_TOKEN } from "../constants";
import { Either } from "../utils/Either";
import apiClient from "./client";

const X_CODEMODCOM_ACCESS_TOKEN = "x-codemod-access-token";
const getAccessToken = async ({
	clerkToken,
}: {
	clerkToken: string;
}): Promise<Either<Error, string>> => {
	try {
		const res = await apiClient.post(
			BUILD_ACCESS_TOKEN,
			{},
			{
				headers: {
					Authorization: `Bearer ${clerkToken}`,
				},
			},
		);
		// Axios automatically converts header names to lowercase in the `headers` object.
		const accessToken = res.headers[X_CODEMODCOM_ACCESS_TOKEN.toLowerCase()];

		if (typeof accessToken !== "string") {
			throw new Error("`accessToken` is not a string.");
		}

		return Either.right(accessToken);
	} catch (e) {
		const err = e as AxiosError<{ message?: string }>;
		return Either.left(new Error(err.response?.data.message ?? err.message));
	}
};

export default getAccessToken;
