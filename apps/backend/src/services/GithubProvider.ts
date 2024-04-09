import axios from "axios";
import gh from "parse-github-url";
import {
	Assignee,
	CreatePRParams,
	GithubRepository,
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
	private readonly __repo: string | null = null;
	private readonly __baseUrl: string;
	private readonly __authHeader: string;

	constructor(oAuthToken: string, repo: string | null) {
		this.__baseUrl = "https://api.github.com";
		this.__repo = repo;

		this.__authHeader = `Bearer ${oAuthToken}`;
	}

	private get __repoUrl() {
		const { owner, name } = parseGithubRepoUrl(this.__repo ?? "");

		return `${this.__baseUrl}/repos/${owner}/${name}`;
	}

	async createIssue(params: NewIssueParams): Promise<Issue> {
		const res = await axios.post(`${this.__repoUrl}/issues`, params, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}

	async createPullRequest(params: CreatePRParams): Promise<PullRequest> {
		const res = await axios.post(`${this.__repoUrl}/pulls`, params, {
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

		const res = await axios.get(`${this.__repoUrl}/pulls?${query}`, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}

	async getAssignees(): Promise<Assignee[]> {
		const res = await axios.get(`${this.__repoUrl}/assignees`, {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}

	async getUserRepositories(): Promise<GithubRepository[]> {
		const res = await axios.get("https://api.github.com/user/repos", {
			headers: {
				Authorization: this.__authHeader,
			},
		});

		return res.data;
	}
}
