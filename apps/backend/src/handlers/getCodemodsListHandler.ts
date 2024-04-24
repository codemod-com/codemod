import { randomBytes } from "node:crypto";
import type { CodemodListResponse } from "@codemod-com/utilities";
import type { CustomHandler } from "../customHandler.js";
import {
	parseClientIdentifierSchema,
	parseListCodemodsQuery,
} from "../schemata/schema.js";
import { ALL_CLAIMS } from "../services/tokenService.js";

export const getCodemodsListHandler: CustomHandler<CodemodListResponse> =
	async ({
		getAccessToken,
		tokenService,
		codemodService,
		telemetryService,
		getClerkUserData,
		request,
	}) => {
		const { search } = parseListCodemodsQuery(request.query);
		const accessToken = getAccessToken();

		const getUserId = async (): Promise<string | null> => {
			if (accessToken === null) {
				return null;
			}

			try {
				return await tokenService.findUserIdMetadataFromToken(
					accessToken,
					BigInt(Date.now()),
					ALL_CLAIMS,
				);
			} catch (err) {
				return null;
			}
		};

		const userId = await getUserId();
		const distinctId = userId ?? randomBytes(16).toString("hex");

		const clientIdentifier = request.headers["x-client-identifier"]
			? parseClientIdentifierSchema(request.headers["x-client-identifier"])
			: "UNKNOWN";

		telemetryService.sendEvent(
			{
				kind: "listNames",
				...(search && { searchTerm: search }),
			},
			{
				cloudRole: clientIdentifier,
				distinctId,
			},
		);

		if (userId === null) {
			return codemodService.getCodemodsList(null, search, []);
		}

		const userData = await getClerkUserData(userId);

		return codemodService.getCodemodsList(
			userId,
			search,
			userData?.allowedNamespaces,
		);
	};
