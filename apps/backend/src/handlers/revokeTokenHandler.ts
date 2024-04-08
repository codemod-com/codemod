import { CustomHandler, UnauthorizedError } from "../customHandler.js";

export const revokeTokenHandler: CustomHandler<{
	success: true;
}> = async (dependencies) => {
	const accessToken = dependencies.getAccessToken();
	if (accessToken === null) {
		throw new UnauthorizedError();
	}

	await dependencies.tokenService.revokeToken(
		accessToken,
		BigInt(dependencies.now()),
	);

	return { success: true };
};
