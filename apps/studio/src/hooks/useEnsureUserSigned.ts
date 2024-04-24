import { useAuth } from "~/hooks/useAuth";
import { PendingAction } from "~/store/zustand/userSession";
import { ToVoid } from "~/types/transformations";

export const useEnsureUserSigned = <T>(
  onSigned: ToVoid<T>,
  pendingAction: PendingAction,
) => {
  const { isSignedIn, getSignIn } = useAuth();

  return isSignedIn
    ? onSigned
    : getSignIn({ withPendingAction: pendingAction });
};
