import {
	CustomHandler,
	InternalServerError,
	UnauthorizedError,
} from "../customHandler.js";
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
		BigInt(Date.now()),
		ALL_CLAIMS,
	);

	const user = await clerkClient.users.getUser(userId);

	if (user.username === null) {
		throw new UnauthorizedError();
	}

	const userOrgs = await clerkClient.users.getOrganizationMembershipList({
		userId,
		limit: 100,
	});

	return {
		success: true,
		username: user.username,
		organizations: userOrgs.map((orgObj) => orgObj.organization),
	};
};
