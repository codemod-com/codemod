import { CustomHandler } from "../customHandler.js";

export const revokeTokenHandler: CustomHandler<{
	success: true;
}> = async (dependencies) => {
	const accessToken = dependencies.getAccessTokenOrThrow();

	await dependencies.tokenService.revokeToken(
		accessToken,
		BigInt(dependencies.now()),
	);

	return { success: true };
};
