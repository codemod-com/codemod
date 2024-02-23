import Axios from "axios";
import type FormData from "form-data";
import { type Input, nullable, object, parse, string } from "valibot";

const X_CODEMOD_ACCESS_TOKEN = "X-Codemod-Access-Token".toLocaleLowerCase();

const dataSchema = object({
	username: nullable(string()),
});

type Data = Input<typeof dataSchema>;

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
