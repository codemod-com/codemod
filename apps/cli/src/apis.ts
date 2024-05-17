import type {
	CodemodListResponse,
	ValidateTokenResponse,
} from '@codemod-com/utilities';
import Axios from 'axios';
import type FormData from 'form-data';

let X_CODEMOD_ACCESS_TOKEN = 'X-Codemod-Access-Token'.toLocaleLowerCase();

export let validateAccessToken = async (
	accessToken: string,
): Promise<ValidateTokenResponse> => {
	let res = await Axios.post<ValidateTokenResponse>(
		`${process.env.BACKEND_URL}/validateAccessToken`,
		{},
		{
			headers: {
				[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			},
			timeout: 5000,
		},
	);

	return res.data;
};

export let publish = async (
	accessToken: string,
	formData: FormData,
): Promise<void> => {
	await Axios.post(`${process.env.BACKEND_URL}/publish`, formData, {
		headers: {
			[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			'Content-Type': 'multipart/form-data',
		},
		timeout: 10000,
	});
};

export let unpublish = async (
	accessToken: string,
	name: string,
): Promise<void> => {
	await Axios.post(
		`${process.env.BACKEND_URL}/unpublish`,
		{ name },
		{
			headers: {
				[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			},
			timeout: 10000,
		},
	);
};

export let revokeCLIToken = async (accessToken: string): Promise<void> => {
	await Axios.delete(`${process.env.BACKEND_URL}/revokeToken`, {
		headers: {
			[X_CODEMOD_ACCESS_TOKEN]: accessToken,
		},
		timeout: 10000,
	});
};

export let getCodemodDownloadURI = async (
	name: string,
	accessToken?: string,
): Promise<string> => {
	let url = new URL(`${process.env.BACKEND_URL}/codemods/downloadLink`);
	if (name) {
		url.searchParams.set('name', name);
	}

	let headers: { [key: string]: string } = {};
	if (accessToken) {
		headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
	}

	let res = await Axios.get<{ link: string }>(url.toString(), {
		headers,
		timeout: 10000,
	});

	return res.data.link;
};

export let getCodemodList = async (options?: {
	accessToken?: string;
	search?: string | null;
}): Promise<CodemodListResponse> => {
	let { accessToken, search } = options ?? {};

	let headers: { [key: string]: string } = {};
	if (accessToken) {
		headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
	}

	let url = new URL(`${process.env.BACKEND_URL}/codemods/list`);
	if (search) {
		url.searchParams.set('search', search);
	}

	let res = await Axios.get<CodemodListResponse>(url.toString(), {
		headers,
		timeout: 10000,
	});

	return res.data;
};

type UserLoginIntentResponse = {
	id: string;
	iv: string;
};
export let generateUserLoginIntent =
	async (): Promise<UserLoginIntentResponse> => {
		let res = await Axios.post<UserLoginIntentResponse>(
			`${process.env.BACKEND_URL}/intents`,
			{},
		);

		return res.data;
	};

type ConfirmUserLoggedInResponse = {
	token: string;
};
export let confirmUserLoggedIn = async (
	sessionId: string,
	iv: string,
): Promise<string> => {
	let res = await Axios.get<ConfirmUserLoggedInResponse>(
		`${process.env.BACKEND_URL}/intents/${sessionId}?iv=${iv}`,
	);

	return res.data.token;
};

type CreateCodeDiffResponse = {
	id: string;
	iv: string;
};
export let createCodeDiff = async (body: {
	beforeSnippet: string;
	afterSnippet: string;
}): Promise<CreateCodeDiffResponse> => {
	let res = await Axios.post<CreateCodeDiffResponse>(
		`${process.env.BACKEND_URL}/diffs`,
		{
			before: body.beforeSnippet,
			after: body.afterSnippet,
			source: 'cli',
		},
	);

	return res.data;
};
