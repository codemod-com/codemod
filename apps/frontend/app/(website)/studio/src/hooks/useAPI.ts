import { useMirageServer } from "@/hooks/useMirageServer";
import { apiClient } from "@/utils/apis/client";
import { useAuth } from "@clerk/nextjs";
import { isServer } from "@studio/config";

const shouldUseMocks =
  !isServer &&
  process.env.NODE_ENV === "development" &&
  Boolean(localStorage?.getItem("useMocks"));

export const useAPI = <T, U = any>(endpoint: string) => {
  useMirageServer(shouldUseMocks);

  const { getToken } = useAuth();
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
    get: async () => await apiClient.get<T>(endpoint, await getHeaders()),
    put: async (body: U) =>
      await apiClient.put<T>(endpoint, body, await getHeaders()),
    post: async (body: U) =>
      await apiClient.post<T>(endpoint, body, await getHeaders()),
  };
};
