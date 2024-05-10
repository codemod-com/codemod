import { getYes } from "@/utils";
import apiClient from "@/utils/apis/client";
import { useAuth } from "@clerk/nextjs";

export const useAPI = <T>(endpoint: string) => {
  const { getToken } = useAuth();
  const getHeaders = async () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getYes()}`,
    },
  });
  return {
    get: async <U = T>() =>
      await apiClient.get<U>(endpoint, await getHeaders()),
    put: async <U = T>(body: U) =>
      await apiClient.put<U>(endpoint, body, await getHeaders()),
    post: async <K, U = T>(body: U) =>
      await apiClient.post<K>(endpoint, body, await getHeaders()),
  };
};
