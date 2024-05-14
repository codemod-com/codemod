import { useRedirectWhenSigned } from "@/hooks/useRedirectWhenSigned";
import { getTestToken } from "@/utils";
import { Button } from "@studio/components/ui/button";
import {
  type PendingAction,
  useUserSession,
} from "@studio/store/zustand/userSession";
import { type FunctionComponent, useState } from "react";

export const useAuth = () => {
  const { resetPendingActions, addPendingActionsWhenSigned } = useUserSession();
  const addRedirectAction = useRedirectWhenSigned();
  const [isLoaded, setIsLoaded] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const router = { push: () => {} }; // Mock router
  const session = {}; // Mock session object
  const clerk = { getToken: () => "mock-token" }; // Mock Clerk functionality
  const searchParams = new Map(); // Mock search parameters
  const signIn = () => setIsSignedIn(true);
  const signOut = () => setIsSignedIn(false);
  const SignIn = (...props: any[]) => (
    <Button {...{ onClick: signIn, ...props }} />
  );
  const SignOut = (...props: any[]) => (
    <Button {...{ onClick: signOut, ...props }} />
  );
  return {
    orgId: "test-org-id",
    orgRole: "test-orgRole",
    orgSlug: "test-orgSlug",
    has: undefined,
    signOut,
    actor: null,
    isLoaded,
    isSignedIn,
    userId: "test-user-id",
    sessionId: "test-session-id",
    getToken: getTestToken,
    SignIn,
    SignUp: SignIn,
    SignInButton: SignIn,
    SignOutButton: SignOut,
    SignedIn: SignIn,
    SignedOut: SignOut,
    UserButton: Button,
    useUser: () => ({ user: {} }),
    session,
    searchParams,
    getSignIn:
      ({
        withPendingAction,
      }: { withPendingAction?: PendingAction } | undefined = {}) =>
      () => {
        resetPendingActions();
        if (withPendingAction) addPendingActionsWhenSigned(withPendingAction);
        router.push();
      },
  };
};

export const withSession = (
  Component: FunctionComponent<{
    session: {
      getToken: () => string | null | undefined;
    };
  }>,
) => Component({ session: { getToken: getTestToken } });
