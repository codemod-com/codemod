import axios from "axios";

export class PostHogService {
  private readonly __authHeader: string;
  private readonly __projectId: string;

  constructor(authKey: string, projectId: string) {
    this.__authHeader = `Bearer ${authKey}`;
    this.__projectId = projectId;
  }

  async getCodemodTotalRuns(codemodName: string): Promise<number> {
    const result = await axios.post(
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

    const totalRuns = result.data?.results[0][0];

    return totalRuns;
  }
}
