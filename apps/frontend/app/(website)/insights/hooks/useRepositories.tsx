import { GH_REPO_LIST } from "@shared/endpoints";
import { useAPI } from "@studio/hooks/useAPI";
import type { GithubRepository } from "be-types";
import { useQuery } from "react-query";

export const useRepositories = () => {
  const { get: getRepositoriesAPI } = useAPI<GithubRepository[]>(GH_REPO_LIST);

  return useQuery(["repos"], getRepositoriesAPI);
};
