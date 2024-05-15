import axios from "axios";

export class CodemodNotFoundError extends Error {}

export class PostHogService {
  private readonly __authHeader: string;
  private readonly __projectId: string;

  constructor(authKey: string, projectId: string) {
    this.__authHeader = `Bearer ${authKey}`;
    this.__projectId = projectId;
  }

  async getCodemodTotalRuns(codemodName: string): Promise<number> {
    try {
      const { data } = await axios.post(
        `https://app.posthog.com/api/projects/${this.__projectId}/query/`,
        {
          query: {
            kind: "HogQLQuery",
            query: `SELECT COUNT() FROM events WHERE (properties.codemodName = '${codemodName}' AND (event = 'codemod.CLI.codemodExecuted' OR event = 'codemod.VSCE.codemodExecuted'))`,
          },
        },
        {
          headers: {
            Authorization: this.__authHeader,
          },
        },
      );

      const totalRuns = data?.results[0][0] ?? 0;

      return totalRuns;
    } catch (error) {
      throw new CodemodNotFoundError();
    }
  }
}
