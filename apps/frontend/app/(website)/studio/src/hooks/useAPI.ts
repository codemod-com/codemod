import { useAuth } from "@clerk/nextjs";
import type { KnownEngines } from "@codemod-com/utilities/src/schemata/codemodConfigSchema";
import apiClient from "@studio/api/client";
import { GithubRepository } from "be-types";

export const mockData = {
  repositories: {
    data: [
      {
        id: 1,
        name: "repo1",
        full_name: "user/repo1",
        private: false,
        html_url: "https://github.com/user/repo1",
        default_branch: "main",
        permissions: {
          admin: true,
          push: true,
          pull: true,
        },
      },
      {
        id: 2,
        name: "repo2",
        full_name: "user/repo2",
        private: true,
        html_url: "https://github.com/user/repo2",
        default_branch: "develop",
        permissions: {
          admin: false,
          push: false,
          pull: true,
        },
      },
    ],
  },
  branches: { data: ["main", "branch1", "branch2"] },
};

const codemodRunMock = {
  codemodExecutionId: "1",
};

export type ExecuteCodemodRequest = {
  engine: KnownEngines;
  source: string;
  target: string;
  branch: string;
  targetPath?: string;
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
    get: async <U = T>() => mockData as unknown as { data: U },
    //   await apiClient.get<U>(endpoint, await getHeaders()),
    put: async <U = T>(body: U) =>
      await apiClient.put<U>(endpoint, {
        ...(await getHeaders()),
        body: JSON.stringify(body),
      }),
    post: async <K, U = T>(body: U) => ({ data: codemodRunMock }),
    // await apiClient.post<K>(endpoint, {
    // 	...(await getHeaders()),
    // 	body: JSON.stringify(body),
    // }),
  };
};
