import type { GithubRepository } from "@/types/object.types";
import apiClient from "@/utils/apis/client";
import type { AxiosError } from "axios";
import { GH_BRANCH_LIST } from "./endpoints";

type GetGHBranchesResponse = Readonly<string[]>;

type GetGHBranchesRequest = Readonly<{
  repo: GithubRepository;
  token: string;
}>;

const getGHBranches = async ({
  repo,
  token,
}: GetGHBranchesRequest): Promise<GetGHBranchesResponse | null> => {
  try {
    const res = await apiClient.post<GetGHBranchesResponse>(
      GH_BRANCH_LIST,
      repo,
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
