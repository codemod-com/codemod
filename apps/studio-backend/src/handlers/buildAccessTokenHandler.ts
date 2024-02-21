import { CustomHandler } from "../customHandler.js";
import { ALL_CLAIMS } from "../services/tokenService.js";

export const buildAccessTokenHandler: CustomHandler<Record<string, never>> =
	async (dependencies) => {
		const userId = await dependencies.getClerkUserId();

		const createdAt = dependencies.now();
		const expiresAt = createdAt + 1000 * 60 * 60 * 24 * 14;

		const token = await dependencies.tokenService.createTokenFromUserId(
			userId,
			ALL_CLAIMS, // TODO add proper claims for the VSCE and the CLI
			createdAt,
			expiresAt,
		);

		dependencies.setAccessToken(token);

		return {};
	};
