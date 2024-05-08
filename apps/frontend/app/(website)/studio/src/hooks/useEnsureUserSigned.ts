import { useAuth } from "@studio/hooks/useAuth";
import type { PendingAction } from "@studio/store/zustand/userSession";
import type { ToVoid } from "@studio/types/transformations";

export const useEnsureUserSigned = <T>(
  onSigned: ToVoid<T>,
  pendingAction: PendingAction,
) => {
  const { isSignedIn, getSignIn } = useAuth();

  return isSignedIn
    ? onSigned
    : getSignIn({ withPendingAction: pendingAction });
};
