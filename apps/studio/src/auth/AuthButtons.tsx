import {
	SignOutButton,
	SignedIn,
	SignedOut,
	UserButton,
	useUser,
} from "@clerk/nextjs";
import { SignIn as SignInIcon } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { LogoutIcon } from "~/icons/LogoutIcon";

const AuthButtons = () => {
	const router = useRouter();
	const { user } = useUser();

	const signUserIn = () => {
		router.push("/auth/sign-in");
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
				<div className=" flex items-center gap-2">
					<UserButton afterSignOutUrl="/" />
					{user?.firstName}
					<SignOutButton>
						<Button
							variant="ghost"
							className="pl-0 hover:bg-transparent"
							hint={<p className="font-normal">Log out</p>}
						>
							<LogoutIcon />
						</Button>
					</SignOutButton>
				</div>
			</SignedIn>
		</>
	);
};

export default AuthButtons;
