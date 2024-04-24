import { useAuth } from "@studio/hooks/useAuth";
import { PendingAction } from "@studio/store/zustand/userSession";
import { ToVoid } from "@studio/types/transformations";

export const useEnsureUserSigned = <T>(
  onSigned: ToVoid<T>,
  pendingAction: PendingAction,
) => {
  const { isSignedIn, getSignIn } = useAuth();

  return isSignedIn
    ? onSigned
    : getSignIn({ withPendingAction: pendingAction });
};
