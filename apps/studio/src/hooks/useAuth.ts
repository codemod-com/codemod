import { useAuth as useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { authUrl } from "~/config";
import {
	PendingAction,
	usePendingActionsOnSignInStore,
} from "~/store/zustand/user";

export const useAuth = () => {
	const router = useRouter();
	const { reset, addPendingActionsWhenSigned } =
		usePendingActionsOnSignInStore();
	return {
		...useClerk(),
		getSignIn:
			({
				withPendingAction,
			}: { withPendingAction?: PendingAction } | undefined = {}) =>
			() => {
				reset();
				if (withPendingAction) addPendingActionsWhenSigned(withPendingAction);
				router.push(authUrl);
			},
	};
};
