import type {
	CodemodListResponse,
	ValidateTokenResponse,
} from "@codemod-com/utilities";
import Axios from "axios";
import type FormData from "form-data";

const X_CODEMOD_ACCESS_TOKEN = "X-Codemod-Access-Token".toLocaleLowerCase();

export const validateAccessToken = async (
	accessToken: string,
): Promise<ValidateTokenResponse> => {
	const res = await Axios.post<ValidateTokenResponse>(
		"https://backend.codemod.com/validateAccessToken",
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

export const publish = async (
	accessToken: string,
	formData: FormData,
): Promise<void> => {
	await Axios.post("https://backend.codemod.com/publish", formData, {
		headers: {
			[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			"Content-Type": "multipart/form-data",
		},
		timeout: 10000,
	});
};

export const revokeCLIToken = async (accessToken: string): Promise<void> => {
	await Axios.delete("https://backend.codemod.com/revokeToken", {
		headers: {
			[X_CODEMOD_ACCESS_TOKEN]: accessToken,
		},
		timeout: 10000,
	});
};

export const getCodemodDownloadURI = async (
	name: string,
	// Will be needed later for querying private codemods
	accessToken?: string,
): Promise<string> => {
	const url = new URL("https://backend.codemod.com/codemods/downloadLink");
	if (name) {
		url.searchParams.set("name", name);
	}

	const headers: { [key: string]: string } = {};
	if (accessToken) {
		headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
	}

	const res = await Axios.get<{ link: string }>(url.toString(), {
		timeout: 10000,
	});

	return res.data.link;
};

export const getCodemodList = async (options?: {
	accessToken?: string;
	search?: string;
}): Promise<CodemodListResponse> => {
	const { accessToken, search } = options ?? {};

	const headers: { [key: string]: string } = {};
	if (accessToken) {
		headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
	}

	const url = new URL("https://backend.codemod.com/codemods/list");
	if (search) {
		url.searchParams.set("search", search);
	}

	const res = await Axios.get<CodemodListResponse>(url.toString(), {
		headers,
		timeout: 10000,
	});

	return res.data;
};

type UserLoginIntentResponse = {
	id: string;
	iv: string;
};
export const generateUserLoginIntent =
	async (): Promise<UserLoginIntentResponse> => {
		const res = await Axios.post<UserLoginIntentResponse>(
			"https://backend.codemod.com/intents",
			{},
		);

		return res.data;
	};

type ConfirmUserLoggedInResponse = {
	token: string;
};
export const confirmUserLoggedIn = async (
	sessionId: string,
	iv: string,
): Promise<string> => {
	const res = await Axios.get<ConfirmUserLoggedInResponse>(
		`https://backend.codemod.com/intents/${sessionId}?iv=${iv}`,
	);

	return res.data.token;
};
