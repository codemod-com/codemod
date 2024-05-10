import { useRedirectWhenSigned } from "@/hooks/useRedirectWhenSigned";
import { useAuth as useClerk } from "@clerk/nextjs";
import { authUrl } from "@studio/config";
import {
  type PendingAction,
  useUserSession,
} from "@studio/store/zustand/userSession";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const { resetPendingActions, addPendingActionsWhenSigned } = useUserSession();
  const addRedirectAction = useRedirectWhenSigned();
  return {
    ...useClerk(),
    getSignIn:
      ({
        withPendingAction,
      }: { withPendingAction?: PendingAction } | undefined = {}) =>
      () => {
        resetPendingActions();
        if (withPendingAction) addPendingActionsWhenSigned(withPendingAction);
        // addRedirectAction();
        router.push(authUrl);
      },
  };
};
