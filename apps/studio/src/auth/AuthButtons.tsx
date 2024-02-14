import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { SignIn as SignInIcon } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { Button } from '~/components/ui/button';

const AuthButtons = () => {
	const router = useRouter();

	const signUserIn = () => {
		router.push('/auth/sign-in');
	};

	return (
		<>
			<SignedOut>
				<Button onClick={signUserIn} size="sm" variant="outline">
					<SignInIcon className="mr-2 h-4 w-4" />
					Sign in
				</Button>
			</SignedOut>
			<SignedIn>
				<div className=" flex items-center gap-2 ">
					<UserButton afterSignOutUrl="/" />
				</div>
			</SignedIn>
		</>
	);
};

export default AuthButtons;
