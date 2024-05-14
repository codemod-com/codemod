import { isDevelopment } from "@/config";
import { useRedirectWhenSigned } from "@/hooks/useRedirectWhenSigned";
import { getTestToken } from "@/utils";
import {
  SignIn,
  SignInButton,
  SignOutButton,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useAuth as useClerk,
  useSession,
  useUser,
} from "@clerk/nextjs";
import { authUrl } from "@studio/config";
import {
  type PendingAction,
  useUserSession,
} from "@studio/store/zustand/userSession";
import { useRouter, useSearchParams } from "next/navigation";
import { FunctionComponent, PureComponent } from "react";
export { useAuth, withSession } from "@auth/useAuthDev";

// export { withSession }  from "@clerk/nextjs";
// export const useAuth = () => {
//   const router = useRouter();
//   const { session } = useSession();
//   const clerk = useClerk();
//   const searchParams = useSearchParams();
//   const { resetPendingActions, addPendingActionsWhenSigned } = useUserSession();
//   const addRedirectAction = useRedirectWhenSigned();
//   const getToken = isDevelopment ? getTestToken : clerk.getToken;
//   return {
//     ...clerk,
//     SignIn,
//     SignUp,
//     SignInButton,
//     SignOutButton,
//     SignedIn,
//     SignedOut,
//     UserButton,
//     useUser,
//     session,
//     searchParams,
//     getToken,
//     getSignIn:
//       ({
//         withPendingAction,
//       }: { withPendingAction?: PendingAction } | undefined = {}) =>
//       () => {
//         resetPendingActions();
//         if (withPendingAction) addPendingActionsWhenSigned(withPendingAction);
//         // addRedirectAction();
//         router.push(authUrl);
//       },
//   };
// };
