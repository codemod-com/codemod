import { getToken } from "@/components/auth/getToken";
import { useMirageServer } from "@/hooks/useMirageServer";
import { apiClient } from "@/utils/apis/client";
import { isServer } from "@studio/config";

const shouldUseMocks =
  !isServer &&
  process.env.NODE_ENV === "development" &&
  Boolean(localStorage?.getItem("useMocks"));

export const useAPI = <T>(endpoint: string) => {
  useMirageServer(shouldUseMocks);

  const getHeaders = async () => {
    const token = await getToken();
    return {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
  };

  return {
    get: async <U = T>() =>
      await apiClient.get<U>(endpoint, await getHeaders()),
    put: async <U = T>(body: U) =>
      await apiClient.put<U>(endpoint, body, await getHeaders()),
    post: async <U, K = T>(body: U) =>
      await apiClient.post<K>(endpoint, body, await getHeaders()),
  };
};
