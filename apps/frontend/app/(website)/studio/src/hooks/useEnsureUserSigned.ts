import { useAuth } from "@/app/auth/useAuth";
import type { PendingAction } from "@studio/store/zustand/userSession";
import type { ToVoid } from "@studio/types/transformations";

export let useEnsureUserSigned = <T>(
  onSigned: ToVoid<T>,
  pendingAction: PendingAction,
) => {
  let { isSignedIn, getSignIn } = useAuth();

  return isSignedIn
    ? onSigned
    : getSignIn({ withPendingAction: pendingAction });
};
