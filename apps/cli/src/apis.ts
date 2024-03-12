import type { AllEngines } from "@codemod-com/utilities";
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
		"http://localhost:8081/validateAccessToken",
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
	await Axios.post("http://localhost:8081/publish", formData, {
		headers: {
			[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			"Content-Type": "multipart/form-data",
		},
		timeout: 10000,
	});
};

export const revokeCLIToken = async (accessToken: string): Promise<void> => {
	await Axios.delete("http://localhost:8081/revokeToken", {
		headers: {
			[X_CODEMOD_ACCESS_TOKEN]: accessToken,
		},
		timeout: 10000,
	});
};

export const getCodemodDownloadURI = async (
	codemodName: string,
	// Will be needed later for querying private codemods
	accessToken?: string,
): Promise<string> => {
	const res = await Axios.get<{ link: string }>(
		`http://localhost:8081/codemods/${codemodName}/downloadLink`,
		{
			headers: {
				[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			},
			timeout: 10000,
		},
	);

	return res.data.link;
};

export type CodemodListReturn = {
	name: string;
	author: string;
	engine: AllEngines;
}[];
export const getCodemodList = async (
	accessToken?: string,
): Promise<CodemodListReturn> => {
	const res = await Axios.get<CodemodListReturn>(
		"http://localhost:8081/codemods/list",
		{
			headers: {
				[X_CODEMOD_ACCESS_TOKEN]: accessToken,
			},
			timeout: 10000,
		},
	);

	return res.data;
};
