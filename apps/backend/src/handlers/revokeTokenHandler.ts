import { CustomHandler } from "../customHandler.js";

export const revokeTokenHandler: CustomHandler<{
	success: true;
}> = async (dependencies) => {
	const accessToken = dependencies.getAccessTokenOrThrow();

	await dependencies.tokenService.revokeToken(accessToken, dependencies.now());

	return { success: true };
};
