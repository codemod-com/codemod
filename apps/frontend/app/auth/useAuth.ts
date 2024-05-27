import { useRedirectWhenSigned } from "@/hooks/useRedirectWhenSigned";
import { devToken, isDevelopment } from "@chatbot/config";
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
  const clerk = useClerk();
  const getToken = isDevelopment ? () => devToken : clerk.getToken;
  return {
    ...clerk,
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
