import type { CodemodListResponse } from "@codemod-com/utilities";

import apiClient from "./client";
import { GET_CODEMODS_LIST } from "~/constants";

export const getCodemodList = async (): Promise<CodemodListResponse | null> => {
	try {
		const res = await apiClient.get<CodemodListResponse>(GET_CODEMODS_LIST);

		return res.data;
	} catch (e) {
		console.error(e);
		return null;
	}
};
