import apiClient from "@/utils/apis/client";
import { useAuth } from "@clerk/nextjs";
import { mockedEndpoints } from "@shared/mocks";
import type { AxiosResponse } from "axios";
const shouldUseMocks =
  process.env.NODE_ENV === "development" && localStorage.getItem("useMocks");
const mockified = (
  verb: "put" | "get" | "post",
  endpoint: string | ((x: any) => string),
  ...rest: any[]
) => {
  const path = typeof endpoint === "function" ? endpoint("") : endpoint;
  // @ts-ignore
  if (mockedEndpoints[path]?.[verb]) {
    // @ts-ignore
    const response = mockedEndpoints[path][verb](...rest);
    return new Promise((r) => setTimeout(() => r(response), 1000));
  }
  // @ts-ignore
  return apiClient[verb](...rest);
};

export const useAPI = <T>(endpoint: string) => {
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
    get: async <U = T>() =>
      await (shouldUseMocks
        ? (mockified("get", endpoint, await getHeaders()) as Promise<
            AxiosResponse<U>
          >)
        : apiClient.get<U>(endpoint, await getHeaders())),
    put: async <U = T>(body: U) =>
      await (shouldUseMocks
        ? (mockified("put", endpoint, body, await getHeaders()) as Promise<
            AxiosResponse<U>
          >)
        : apiClient.put<U>(endpoint, body, await getHeaders())),
    post: async <U, K = T>(body: U) =>
      await (shouldUseMocks
        ? (mockified("post", endpoint, body, await getHeaders()) as Promise<
            AxiosResponse<K>
          >)
        : apiClient.post<K>(endpoint, body, await getHeaders())),
  };
};
