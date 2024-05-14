import { useRedirectWhenSigned } from "@/hooks/useRedirectWhenSigned";
import { getTestToken } from "@/utils";
import { Button } from "@studio/components/ui/button";
import {
  type PendingAction,
  useUserSession,
} from "@studio/store/zustand/userSession";
import { type FunctionComponent, useState } from "react";
import { identity } from "ramda";

export let isSignedIn = false;
export let setIsSignedIn = (b: boolean) => isSignedIn = b;


export let isLoaded = true;
export let setIsLoaded = (b: boolean) => isLoaded = b;

export const useAuth = () => {
  const { resetPendingActions, addPendingActionsWhenSigned } = useUserSession();
  const addRedirectAction = useRedirectWhenSigned();
  const router = { push: () => {} }; // Mock router
  const session = {}; // Mock session object
  console.log({isSignedIn})
  const clerk = { getToken: () => "mock-token" }; // Mock Clerk functionality
  const searchParams = new Map(); // Mock search parameters
  const signIn = () => setIsSignedIn(true);
  const signOut = identity;
  const SignIn = (...props: any[]) => (
    <Button {...{ onClick: signIn, ...props }} />
  );
  const SignOut = (...props: any[]) => (
    <Button {...{ onClick: identity, ...props }} />
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
      }: { withPendingAction?: PendingAction } | undefined = {}) => signIn,
  };
};

export const withSession = (
  Component: FunctionComponent<{
    session: {
      getToken: () => string | null | undefined;
    };
  }>,
) => Component({ session: { getToken: getTestToken } });
