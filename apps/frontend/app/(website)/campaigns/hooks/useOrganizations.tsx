import type { GithubOrganization } from "@codemod-com/api-types";
import { GH_ORGANIZATION_LIST } from "@mocks/endpoints/gh-run";
import { useAPI } from "@studio/hooks/useAPI";
import { useQuery } from "react-query";

export const useOrganizations = () => {
  const { get: getOrganizations } =
    useAPI<GithubOrganization[]>(GH_ORGANIZATION_LIST);

  return useQuery(["orgs"], getOrganizations);
};
