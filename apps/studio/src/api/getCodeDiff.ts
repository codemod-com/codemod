import apiClient from "./client";

type GetCodeDiffResponse = {
	before: string;
	after: string;
};

export const getCodeDiff = async (
	diffId: string,
): Promise<GetCodeDiffResponse | null> => {
	try {
		const res = await apiClient.get<GetCodeDiffResponse>(`diffs/${diffId}`);
		// Axios automatically converts header names to lowercase in the `headers` object.

		return res.data;
	} catch (e) {
		console.log(e);
		return null;
	}
};
