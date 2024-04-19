import { SignIn } from "@clerk/nextjs";

function SignInPage() {
	return (
		<div className=" flex h-screen w-screen items-center justify-center">
			<SignIn signUpUrl="/auth/sign-up" />
		</div>
	);
}

export default SignInPage;
