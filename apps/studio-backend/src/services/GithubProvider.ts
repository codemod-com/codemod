import axios from "axios";
import gh from "parse-github-url";
import {
	Assignee,
	CreatePRParams,
	Issue,
	ListPRParams,
	NewIssueParams,
	PullRequest,
	SourceControlProvider,
} from "./SourceControl.js";

type Repository = {
	owner: string;
	name: string;
};

class InvalidGithubUrlError extends Error {}
class ParseGithubUrlError extends Error {}

function parseGithubRepoUrl(url: string): Repository {
	try {
		const { owner, name } = gh(url) ?? {};

		if (!owner || !name) {
			throw new InvalidGithubUrlError("Missing owner or name");
		}

		return { owner, name };
	} catch (e) {
		if (e instanceof InvalidGithubUrlError) {
			throw e;
		}

		const errorMessage = e instanceof Error ? e.message : String(e);
		throw new ParseGithubUrlError(errorMessage);
	}
}

export class GithubProvider implements SourceControlProvider {
	private readonly __repo: Repository;
	private readonly __baseUrl: string;
	private readonly __authHeader: string;

	constructor(repo: string, oAuthToken: string) {
		const parsedRepoUrl = parseGithubRepoUrl(repo);

		this.__repo = parsedRepoUrl;
		this.__baseUrl = `https://api.github.com/repos/${this.__repo.owner}/${this.__repo.name}`;
		this.__authHeader = `Bearer ${oAuthToken}`;
	}

	async createIssue(params: NewIssueParams): Promise<Issue> {
		const res = await axios.post(`${this.__baseUrl}/issues`, params, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}

	async createPullRequest(params: CreatePRParams): Promise<PullRequest> {
		const res = await axios.post(`${this.__baseUrl}/pulls`, params, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}

	async getPullRequests(params: ListPRParams): Promise<PullRequest[]> {
		const queryParams = Object.entries(params).reduce<Record<string, string>>(
			(acc, [key, value]) => {
				if (value) {
					acc[key] = value;
				}

				return acc;
			},
			{},
		);

		const query = new URLSearchParams(queryParams).toString();

		const res = await axios.get(`${this.__baseUrl}/pulls?${query}`, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}

	async getAssignees(): Promise<Assignee[]> {
		const res = await axios.get(`${this.__baseUrl}/assignees`, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}
}
