import type { CodemodListReturn } from "@codemod-com/utilities";
import Axios from "axios";
import type FormData from "form-data";
import { type Output, nullable, object, parse, string } from "valibot";

const X_CODEMOD_ACCESS_TOKEN = "X-Codemod-Access-Token".toLocaleLowerCase();

const dataSchema = object({
	username: nullable(string()),
});

type Data = Output<typeof dataSchema>;

export const validateAccessToken = async (
	accessToken: string,
): Promise<Data> => {
	const response = await Axios.post(
		"https://backend.codemod.com/validateAccessToken",
		{},
		{
			headers: {
				[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			},
			timeout: 5000,
		},
	);

	return parse(dataSchema, response.data);
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
}): Promise<CodemodListReturn> => {
	const { accessToken, search } = options ?? {};

	const headers: { [key: string]: string } = {};
	if (accessToken) {
		headers[X_CODEMOD_ACCESS_TOKEN] = accessToken;
	}

	const url = new URL("https://backend.codemod.com/codemods/list");
	if (search) {
		url.searchParams.set("search", search);
	}

	const res = await Axios.get<CodemodListReturn>(url.toString(), {
		headers,
		timeout: 10000,
	});

	return res.data;
};
