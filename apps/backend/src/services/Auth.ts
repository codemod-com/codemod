import axios, { isAxiosError } from 'axios';

export class AuthError extends Error {}

let USER_ID_REGEX = /^[a-z0-9_]+$/i;

export class Auth {
	private readonly __authHeader: string;
	constructor(authKey: string) {
		if (!authKey) {
			throw new AuthError('Invalid auth key provided.');
		}

		this.__authHeader = `Bearer ${authKey}`;
	}

	async getOAuthToken(userId: string, provider: 'github'): Promise<string> {
		try {
			if (!USER_ID_REGEX.test(userId)) {
				throw new AuthError('Invalid userId.');
			}

			let result = await axios.get(
				`https://api.clerk.dev/v1/users/${userId}/oauth_access_tokens/${provider}`,
				{
					headers: {
						Authorization: this.__authHeader,
					},
				},
			);

			let token = result.data[0]?.token;

			if (!token) {
				throw new AuthError('Missing OAuth token');
			}

			return token;
		} catch (e) {
			let errorMessage = isAxiosError<{ message: string }>(e)
				? e.response?.data.message
				: (e as Error).message;

			throw new AuthError(
				`Failed to retrieve OAuth token for ${provider}. Reason: ${errorMessage}`,
			);
		}
	}
}
