import { useAuth as useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { authUrl } from "~/config";
import {
  type PendingAction,
  useUserSession,
} from "~/store/zustand/userSession";

export const useAuth = () => {
  const router = useRouter();
  const { resetPendingActions, addPendingActionsWhenSigned } = useUserSession();
  return {
    ...useClerk(),
    getSignIn:
      ({
        withPendingAction,
      }: { withPendingAction?: PendingAction } | undefined = {}) =>
      () => {
        resetPendingActions();
        if (withPendingAction) addPendingActionsWhenSigned(withPendingAction);
        router.push(authUrl);
      },
  };
};
