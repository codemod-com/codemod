import { useAuth } from '@clerk/nextjs';
import { type ReactNode } from 'react';

type Props = {
	isAuthenticated?: boolean;
	children?: ReactNode;
};

const tooltipProps = {
	'data-tip-disable': false,
	'data-tooltip-content': 'Sign in to use ModGPT',
	'data-tooltip-id': 'button-tooltip',
};

const AuthenticatedAccess = ({ children }: Props) => {
	const { isSignedIn } = useAuth();

	if (isSignedIn) {
		return <>{children}</>;
	}

	return (
		<div {...tooltipProps} className="h-full w-full">
			<div className="pointer-events-none flex h-full w-full flex-col grayscale">
				{children}
			</div>
		</div>
	);
};

export default AuthenticatedAccess;
