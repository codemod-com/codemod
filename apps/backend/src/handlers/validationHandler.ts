import { CustomHandler, InternalServerError } from "../customHandler.js";
import { ALL_CLAIMS } from "../services/tokenService.js";

export const validationHandler: CustomHandler<{
	success: true;
	username: string | null;
}> = async ({ clerkClient, tokenService, getAccessTokenOrThrow }) => {
	if (clerkClient === null) {
		throw new InternalServerError();
	}

	const accessToken = getAccessTokenOrThrow();

	const userId = await tokenService.findUserIdMetadataFromToken(
		accessToken,
		Date.now(),
		ALL_CLAIMS,
	);

	const user = await clerkClient.users.getUser(userId);

	// TODO: return orgs

	return {
		success: true,
		username: user.username,
	};
};
