import WButton from "@/components/shared/Button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { SignIn as SignInIcon } from "@phosphor-icons/react";
import { Button as SButton } from "@studio/components/ui/button";

import { useRouter } from "next/navigation";

const AuthButtons = ({
  variant = "studio",
  redirectUrl,
}: { variant: "studio" | "www"; redirectUrl: string }) => {
  const isStudio = variant === "studio";
  const router = useRouter();

  const signUserIn = () => {
    const queryParams = new URLSearchParams({ variant }).toString();
    router.push(`/auth/sign-in?${queryParams}`);
  };

  const Button = isStudio ? SButton : WButton;
  return (
    <>
      <SignedOut>
        <Button
          onClick={signUserIn}
          size="sm"
          variant="outline"
          intent="inline"
        >
          {isStudio && <SignInIcon className="mr-2 h-4 w-4" />}
          Sign in
        </Button>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl={redirectUrl} />
        </div>
      </SignedIn>
    </>
  );
};

export default AuthButtons;
