import axios, { isAxiosError } from "axios";

export class PostHogCodemodNotFoundError extends Error {}

export class PostHogService {
  private readonly __authHeader: string;
  private readonly __projectId: string;

  constructor(authKey: string, projectId: string) {
    this.__authHeader = `Bearer ${authKey}`;
    this.__projectId = projectId;
  }

  async getCodemodTotalRuns(): Promise<Array<{ slug: string; runs: number }>> {
    try {
      const { data } = await axios.post(
        `https://app.posthog.com/api/projects/${this.__projectId}/query/`,
        {
          query: {
            kind: "HogQLQuery",
            query:
              "select properties.codemodName, count(*) from events where event in ('codemod.CLI.codemodExecuted', 'codemod.VSCE.codemodExecuted') group by properties.codemodName",
          },
        },
        {
          headers: {
            Authorization: this.__authHeader,
          },
        },
      );

      const result = data?.results?.map((value: [string, number]) => ({
        slug: value[0]
          .replaceAll(" (from user machine)", "")
          .replaceAll("/", "-"),
        runs: value[1],
      }));

      return result;
    } catch (error) {
      const errorMessage = isAxiosError<{ message: string }>(error)
        ? error.response?.data.message
        : (error as Error).message;

      throw new PostHogCodemodNotFoundError(
        `Failed to retrieve events. Reason: ${errorMessage}`,
      );
    }
  }
}
