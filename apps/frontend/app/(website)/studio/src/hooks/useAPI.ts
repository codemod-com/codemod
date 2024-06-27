import { apiClient } from "@/utils/apis/client";
import { useAuth } from "@clerk/nextjs";
import { mockedEndpoints } from "@shared/mocks";
import { isServer } from "@studio/config";

const shouldUseMocks =
  !isServer &&
  process.env.NODE_ENV === "development" &&
  Boolean(localStorage?.getItem("useMocks"));
const mockified = (
  verb: "PUT" | "GET" | "POST",
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
  return apiClient(path, { method: verb, ...rest });
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
        ? (mockified("GET", endpoint, await getHeaders()) as Promise<U>)
        : ((
            await apiClient(endpoint, {
              method: "GET",
              ...(await getHeaders()),
            })
          ).json() as Promise<U>)),
    put: async <U = T>(body: U) =>
      await (shouldUseMocks
        ? (mockified("PUT", endpoint, body, await getHeaders()) as Promise<U>)
        : ((
            await apiClient(endpoint, {
              method: "PUT",
              body: JSON.stringify(body),
              ...(await getHeaders()),
            })
          ).json() as Promise<U>)),
    post: async <U, K = T>(body: U) =>
      await (shouldUseMocks
        ? (mockified("POST", endpoint, body, await getHeaders()) as Promise<K>)
        : ((
            await apiClient(endpoint, {
              method: "POST",
              body: JSON.stringify(body),
              ...(await getHeaders()),
            })
          ).json() as Promise<K>)),
  };
};
