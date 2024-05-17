import apiClient from "@/utils/apis/client";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import type { AxiosError } from "axios";
import { BUILD_ACCESS_TOKEN } from "../constants";
import { Either } from "../utils/Either";

let X_CODEMODCOM_ACCESS_TOKEN = "x-codemod-access-token";
let getAccessToken = async ({
  clerkToken,
  sessionId,
  iv,
}: {
  clerkToken: string;
  sessionId?: string | null;
  iv?: string | null;
}): Promise<Either<Error, string>> => {
  let searchParams = new URLSearchParams();
  if (isNeitherNullNorUndefined(sessionId)) {
    searchParams.set("sessionId", sessionId);
  }
  if (isNeitherNullNorUndefined(iv)) {
    searchParams.set("iv", iv);
  }

  try {
    let res = await apiClient.post(
      `${BUILD_ACCESS_TOKEN}${
        searchParams.size > 0 ? `?${searchParams.toString()}` : ""
      }`,
      {},
      {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    );
    // Axios automatically converts header names to lowercase in the `headers` object.
    let accessToken = res.headers[X_CODEMODCOM_ACCESS_TOKEN.toLowerCase()];

    if (typeof accessToken !== "string") {
      throw new Error("`accessToken` is not a string.");
    }

    return Either.right(accessToken);
  } catch (e) {
    let err = e as AxiosError<{ message?: string }>;
    return Either.left(new Error(err.response?.data.message ?? err.message));
  }
};

export default getAccessToken;
