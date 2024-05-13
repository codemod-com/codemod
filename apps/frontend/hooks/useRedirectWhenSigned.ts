import { useUserSession } from "@studio/store/zustand/userSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocation } from "react-use";

export const useRedirectWhenSigned = () => {
  const router = useRouter();
  const location = useLocation();
  const {
    retrievePendingAction,
    resetPendingActions,
    addPendingActionsWhenSigned,
  } = useUserSession();
  useEffect(() => {
    if (retrievePendingAction("redirectToRegister")) {
      router.push("/register");
    }
    if (retrievePendingAction("redirectToStudio")) {
      router.push("/studio");
    }
  }, []);
  const { pathname } = location;
  return () =>
    pathname?.includes("studio")
      ? addPendingActionsWhenSigned("redirectToStudio")
      : addPendingActionsWhenSigned("redirectToRegister");
};
