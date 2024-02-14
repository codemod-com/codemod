/* eslint-disable no-unused-expressions */
import { withSession } from '@clerk/nextjs';
import { useEffect } from 'react';

const TOKEN_STORAGE_KEY = 'token';

type AuthStoreProps = {
	session: {
		getToken: () => Promise<string | null>;
	};
};

const AuthStore = ({ session }: AuthStoreProps) => {
	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const fn = async () => {
			const token = await session.getToken();
			token && localStorage.setItem(TOKEN_STORAGE_KEY, token);
			!token && localStorage.removeItem(TOKEN_STORAGE_KEY);
		};

		fn();
	}, [session, session.getToken]);

	return null;
};

export default withSession(AuthStore);
