import { type CustomHandler, UnauthorizedError } from '../customHandler.js';

export let revokeTokenHandler: CustomHandler<{
	success: true;
}> = async (dependencies) => {
	let accessToken = dependencies.getAccessToken();
	if (accessToken === null) {
		throw new UnauthorizedError();
	}

	await dependencies.tokenService.revokeToken(
		accessToken,
		BigInt(dependencies.now()),
	);

	return { success: true };
};
