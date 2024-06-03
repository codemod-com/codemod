import apiClient from "@/utils/apis/client";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import type { AxiosError } from "axios";
import { POPULATE_LOGIN_INTENT } from "../constants";
import { Either } from "../utils/Either";

export const populateLoginIntent = async ({
  clerkToken,
  sessionId,
  iv,
}: {
  clerkToken: string;
  sessionId?: string | null;
  iv?: string | null;
}): Promise<Either<Error, string>> => {
  const searchParams = new URLSearchParams();
  if (isNeitherNullNorUndefined(sessionId)) {
    searchParams.set("sessionId", sessionId);
  }
  if (isNeitherNullNorUndefined(iv)) {
    searchParams.set("iv", iv);
  }

  try {
    const res = await apiClient.post(
      `${POPULATE_LOGIN_INTENT}${
        searchParams.size > 0 ? `?${searchParams.toString()}` : ""
      }`,
      {},
      { headers: { Authorization: `Bearer ${clerkToken}` } },
    );

    const accessToken = res.data.accessToken;

    if (typeof accessToken !== "string") {
      throw new Error("`accessToken` is not a string.");
    }

    return Either.right(accessToken);
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return Either.left(new Error(err.response?.data.message ?? err.message));
  }
};
