import { getTestToken } from "@/utils";
import apiClient from "@/utils/apis/client";
import { useAuth } from "@clerk/nextjs";

export let useAPI = <T>(endpoint: string) => {
  let { getToken } = useAuth();
  let getHeaders = async () => {
    let token = await getToken();
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
    post: async <K, U = T>(body: U) =>
      await apiClient.post<K>(endpoint, body, await getHeaders()),
  };
};
