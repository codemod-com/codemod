import { SignIn } from "@clerk/nextjs";
import { authUrl } from "~/config";

function SignInPage() {
  return (
    <div className=" flex h-screen w-screen items-center justify-center">
      <SignIn signUpUrl={authUrl} />
    </div>
  );
}

export default SignInPage;
