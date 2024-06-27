import {
  buildCodemodSlug,
  extendedFetch,
  isFetchError,
} from "@codemod-com/utilities";

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
      const response = await extendedFetch(
        `https://app.posthog.com/api/projects/${this.__projectId}/query/`,
        {
          method: "POST",
          headers: { Authorization: this.__authHeader },
          body: JSON.stringify({
            query: {
              kind: "HogQLQuery",
              query:
                "select properties.codemodName, count(*) from events where event in ('codemod.CLI.codemodExecuted', 'codemod.VSCE.codemodExecuted') group by properties.codemodName limit 500",
            },
          }),
        },
      );
      const { data } = (await response.json()) as {
        data: { results: Array<[string, number]> };
      };

      const result = data?.results?.map((value: [string, number]) => ({
        // @TODO add isLocal field to telemetry event, exclude local events from total runs
        slug: buildCodemodSlug(value[0].replaceAll(" (from user machine)", "")),
        runs: value[1],
      }));

      return result;
    } catch (error) {
      const errorMessage = isFetchError(error)
        ? ((await error.response?.json()) as { message: string }).message
        : (error as Error).message;

      throw new PostHogCodemodNotFoundError(
        `Failed to retrieve events. Reason: ${errorMessage}`,
      );
    }
  }
}
