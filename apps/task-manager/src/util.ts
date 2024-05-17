import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import gh from 'parse-github-url';

import { parseEnvironment } from './schemata/env.js';

export let environment = parseEnvironment(process.env);

class InvalidGithubUrlError extends Error {}
class ParseGithubUrlError extends Error {}
class AxiosRequestError extends Error {}

type Repository = {
	authorName: string;
	repoName: string;
};

export function parseGithubRepoUrl(url: string): Repository {
	try {
		let { owner, name } = gh(url) ?? {};
		if (!owner || !name)
			throw new InvalidGithubUrlError('Missing owner or name');

		return { authorName: owner, repoName: name };
	} catch (error) {
		let errorMessage =
			error instanceof Error ? error.message : String(error);
		throw new ParseGithubUrlError(errorMessage);
	}
}

export async function axiosRequest<T>(
	url: string,
	method: 'get' | 'post' | 'put' | 'delete',
	data: Record<string, unknown> | null,
	headers?: Record<string, string>,
): Promise<T> {
	try {
		let config: AxiosRequestConfig = {
			url,
			method,
			data,
			headers,
		};

		let res: AxiosResponse<T> = await axios(config);
		return res.data;
	} catch (error) {
		throw new AxiosRequestError();
	}
}
