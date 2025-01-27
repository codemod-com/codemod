import { getToken as getTokenFromSession } from "@/components/auth/getToken";
import { useRedirectWhenSigned } from "@/hooks/useRedirectWhenSigned";
import { devToken, isDevelopment } from "@chatbot/config";
import { authUrl } from "@studio/config";
import {
  type PendingAction,
  useUserSession,
} from "@studio/store/utils/userSession";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const router = useRouter();
  const { resetPendingActions, addPendingActionsWhenSigned } = useUserSession();
  const addRedirectAction = useRedirectWhenSigned();
  const getToken = isDevelopment ? () => devToken : getTokenFromSession;
  const { status } = useSession();
  const isSignedIn = status === "authenticated";
  return {
    isSignedIn,
    getToken,
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
