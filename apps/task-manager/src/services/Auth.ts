import axios, { isAxiosError } from 'axios';

export class AuthError extends Error {}

const USER_ID_REGEX = /^[a-z0-9_]+$/i;

export class AuthService {
	private readonly __authHeader: string;

	constructor(authKey: string) {
		if (!authKey) {
			throw new AuthError('Invalid auth key provided.');
		}
		this.__authHeader = `Bearer ${authKey}`;
	}

	async getAuthToken(userId: string): Promise<string> {
		try {
			if (!USER_ID_REGEX.test(userId)) {
				throw new AuthError('Invalid userId.');
			}

			const response = await fetch(
				`https://api.clerk.dev/v1/users/${userId}/oauth_access_tokens/github`,
				{ headers: { Authorization: this.__authHeader } },
			);
			if (!response.ok) {
				throw new Error('Failed to fetch data');
			}
			const result = { data: await response.json() };

			const token = result.data[0]?.token;

			if (!token) {
				throw new AuthError('Missing OAuth token');
			}

			return token;
		} catch (error) {
			const { message } = error as Error;

			throw new AuthError(
				`Failed to retrieve OAuth token for GitHub. Reason: ${message}`,
			);
		}
	}
}
