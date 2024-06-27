import { authApiClient } from "@/utils/apis/client";
import type { FetchError } from "@codemod-com/utilities";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
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
    const res = await authApiClient.post(
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
    const err = e as FetchError;
    return Either.left(
      new Error(
        ((await err.response?.json()) as { message?: string }).message ??
          err.message,
      ),
    );
  }
};
