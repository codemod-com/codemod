import apiClient from "@/utils/apis/client";
import type { AxiosError } from "axios";
import type { GithubRepository } from "be-types";
import { GH_BRANCH_LIST } from "./endpoints";

type GetGHBranchesResponse = Readonly<string[]>;

type GetGHBranchesRequest = Readonly<{
  repoUrl: string;
  token: string;
}>;

const getGHBranches = async ({
  repoUrl,
  token,
}: GetGHBranchesRequest): Promise<GetGHBranchesResponse | null> => {
  try {
    const res = await apiClient.post<GetGHBranchesResponse>(
      GH_BRANCH_LIST,
      { repoUrl },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return res.data ?? null;
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    console.error(err.response?.data.message ?? err.message);
    return null;
  }
};

export default getGHBranches;
