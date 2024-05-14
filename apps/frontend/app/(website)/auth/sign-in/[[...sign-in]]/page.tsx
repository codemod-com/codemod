import { useAuth } from "@auth/useAuth";

function SignInPage() {
  const { SignIn } = useAuth();
  return (
    <div className=" flex h-screen w-screen items-center justify-center">
      <SignIn signUpUrl="/auth/sign-up" />
    </div>
  );
}

export default SignInPage;
