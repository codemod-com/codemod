import {
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { SignIn as SignInIcon } from "@phosphor-icons/react";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/hooks/useAuth";
import { LogoutIcon } from "~/icons/LogoutIcon";

const AuthButtons = () => {
  const { getSignIn } = useAuth();
  const { user } = useUser();

  return (
    <>
      <SignedOut>
        <Button onClick={getSignIn()} size="sm" variant="outline">
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
