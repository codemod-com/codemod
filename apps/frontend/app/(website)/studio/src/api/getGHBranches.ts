import type { AxiosError } from "axios";
import type { GithubRepository } from "be-types";
import { GH_BRANCH_LIST } from "../constants";
import { Either } from "../utils/Either";
import apiClient from "./client";

type GetGHBranchesResponse = Readonly<string[]>;

type GetGHBranchesRequest = Readonly<{
  repo: GithubRepository;
  token: string;
}>;

const getGHBranches = async ({
  repo,
  token,
}: GetGHBranchesRequest): Promise<Either<Error, GetGHBranchesResponse>> => {
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

    return Either.right(res.data);
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return Either.left(new Error(err.response?.data.message ?? err.message));
  }
};

export default getGHBranches;
