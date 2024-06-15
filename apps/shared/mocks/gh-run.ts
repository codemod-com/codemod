import type {
	GHBranch,
	GithubRepository,
} from '../../backend/src/services/SourceControl';
import {
	GET_EXECUTION_STATUS,
	GH_BRANCH_LIST,
	GH_REPO_LIST,
	RUN_CODEMOD,
} from '../endpoints';
import type {
	CodemodRunStatus,
	GetExecutionStatusResponse,
	Result,
} from '../types';

let isSuccess = true;
let errorExecutionResult: Result = {
	status: 'error',
	message: 'error msg',
};
let executionResultsIndex = 0;
let getExecutionResults = (): Result[] => [
	{
		status: 'progress',
		message: 'progress msg 1',
	},
	{
		status: 'progress',
		message: 'progress msg 2',
	},
	{
		status: 'executing codemod',
		progress: { processed: 0, total: 100 },
	},
	{
		status: 'executing codemod',
		progress: { processed: 30, total: 100 },
	},
	{
		status: 'executing codemod',
		progress: { processed: 80, total: 100 },
	},
	isSuccess
		? {
				status: 'done',
				link: 'https://www.google.com', // PR Link
			}
		: errorExecutionResult,
];

export let mockGithubRepositories: GithubRepository[] = [
	{
		id: 1,
		name: 'successRepo',
		full_name: 'mockUser/success',
		private: false,
		html_url: 'success',
		default_branch: 'main',
		permissions: {
			admin: false,
			push: true,
			pull: true,
		},
	},
	{
		id: 2,
		name: 'failRepo',
		full_name: 'mockUser/fail',
		private: true,
		html_url: 'fail',
		default_branch: 'master',
		permissions: {
			admin: true,
			push: true,
			pull: false,
		},
	},
];
export let mockGHBranches: GHBranch[] = [
	{
		name: 'branch1',
		commit: { sha: 'sha1', url: 'url1' },
		protected: true,
		protection: {
			enabled: true,
			required_status_checks: {
				enforcement_level: 'level1',
				contexts: ['context1', 'context2'],
			},
		},
	},
	{
		name: 'branch2',
		commit: { sha: 'sha2', url: 'url2' },
		protected: false,
		protection: {
			enabled: false,
			required_status_checks: {
				enforcement_level: 'level2',
				contexts: ['context3', 'context4'],
			},
		},
	},
];
export let mockedGhRunEndpoints = {
	[GH_REPO_LIST]: {
		get: (): { data: GithubRepository[] } => ({
			data: mockGithubRepositories,
		}),
	},
	[GH_BRANCH_LIST]: {
		post: ({ repoUrl }: { repoUrl: string }): { data: GHBranch[] } => {
			isSuccess = repoUrl === 'success';
			return {
				data: mockGHBranches,
			};
		},
	},
	[RUN_CODEMOD]: {
		post: (): { data: CodemodRunStatus } => ({
			data: { codemodRunId: '1', success: true },
		}),
	},
	[GET_EXECUTION_STATUS('1')]: {
		get: (): { data: GetExecutionStatusResponse } => {
			let index = executionResultsIndex;
			executionResultsIndex =
				executionResultsIndex === getExecutionResults().length
					? 0
					: executionResultsIndex + 1;
			return {
				data: {
					result: getExecutionResults()[index] || null,
					success: true,
				},
			};
		},
	},
};
