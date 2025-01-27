import { SignedIn } from "@/components/auth/SignedIn";
import { SignedOut } from "@/components/auth/SignedOut";
import { UserButton } from "@/components/auth/UserButton";
import WButton from "@/components/shared/Button";
import { SignIn as SignInIcon } from "@phosphor-icons/react";
import { Button as SButton } from "@studio/components/ui/button";
import { signIn } from "next-auth/react";

const AuthButtons = ({
  variant = "studio",
  redirectUrl,
}: { variant: "studio" | "www"; redirectUrl: string }) => {
  const isStudio = variant === "studio";

  const Button = isStudio ? SButton : WButton;
  return (
    <>
      <SignedOut>
        <Button
          onClick={() => signIn()}
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
