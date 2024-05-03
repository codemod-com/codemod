import apiClient from "@/utils/apis/client";
import { useAuth } from "@clerk/nextjs";

export type ExecuteCodemodRequest = {
  codemodEngine: "jscodeshift" | "ts-morph"; // other engines are not supported by backend API
  codemodSource: string;
  codemodName: string;
  repoUrl: string;
  branch?: string; // not supported by backend API
  targetPath?: string; // not supported by backend API
};

export type ExecuteCodemodResponse = {
  success: boolean;
  codemodRunId: string;
};

export const useAPI = <T>(endpoint: string) => {
  const { getToken } = useAuth();
  const getHeaders = async () => ({
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await getToken()}`,
    },
  });
  return {
    get: async <U = T>() =>
      await apiClient.get<U>(endpoint, await getHeaders()),
    put: async <U = T>(body: U) =>
      await apiClient.put<U>(endpoint, {
        body,
        ...(await getHeaders()),
      }),
    post: async <K, U = T>(body: U) =>
      await apiClient.post<K>(endpoint, {
        body,
        ...(await getHeaders()),
      }),
  };
};
