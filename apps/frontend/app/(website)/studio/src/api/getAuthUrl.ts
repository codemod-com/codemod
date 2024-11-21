import { authApiClient } from "@/utils/apis/client";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import { POPULATE_LOGIN_INTENT } from "../constants";

export const getAuthUrl = async ({
  sessionId,
  iv,
}: {
  sessionId?: string | null;
  iv?: string | null;
}): Promise<string> => {
  const searchParams = new URLSearchParams();
  if (isNeitherNullNorUndefined(sessionId)) {
    searchParams.set("sessionId", sessionId);
  }
  if (isNeitherNullNorUndefined(iv)) {
    searchParams.set("iv", iv);
  }

  try {
    const { data } = await authApiClient.get<{ url: string }>(
      `${POPULATE_LOGIN_INTENT}${
        searchParams.size > 0 ? `?${searchParams.toString()}` : ""
      }`,
      {},
    );

    const url = data.url;

    return url;
  } catch (e) {
    return "";
  }
};
