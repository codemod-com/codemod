import { useAuth } from "@clerk/nextjs";
import type { KnownEngines } from "@codemod-com/utilities/src/schemata/codemodConfigSchema";
import type { GithubRepository } from "be-types";
import apiClient from "~/api/client";

const repositoriesMock: { data: GithubRepository[] } = {
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
};

const codemodRunMock = {
  codemodExecutionId: "1",
};

export type ExecuteCodemodRequest = {
  engine: KnownEngines;
  source: string;
  target: string;
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
    get: async <U = T>() => repositoriesMock,
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
