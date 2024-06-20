import { uniq, without } from "ramda";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ToVoid } from "../../types/transformations";

export const pendingActions = [
	"openRepoModal",
	"redirectToStudio",
	"redirectToRegister",
] as const;
export type PendingAction = (typeof pendingActions)[number];

type UserSessionGet = {
	pendingActionsWhenSigned: PendingAction[];
	codemodExecutionId: string | null;
};

export type UserSessionStore = UserSessionGet & {
	setPendingActions: ToVoid<PendingAction[]>;
	setCodemodExecutionId: ToVoid<string | null>;
	addPendingActionsWhenSigned: ToVoid<PendingAction>;
	retrievePendingAction: (action: PendingAction) => boolean;
	hasPendingAction: (action: PendingAction) => boolean;
	resetPendingActions: VoidFunction;
};

const buildDefaultUserSession = (): UserSessionGet => ({
	pendingActionsWhenSigned: [],
	codemodExecutionId: null,
});

export const useUserSession = create<UserSessionStore>()(
	persist(
		(set, get) => ({
			...buildDefaultUserSession(),
			setCodemodExecutionId: (codemodExecutionId: string | null) => {
				set({ codemodExecutionId });
			},
			setPendingActions: (actions: PendingAction[]) => {
				const uniqActions = uniq(actions);
				set({ pendingActionsWhenSigned: uniqActions });
			},
			hasPendingAction: (action: PendingAction) =>
				get().pendingActionsWhenSigned.includes(action),
			addPendingActionsWhenSigned: (action: PendingAction) =>
				get().setPendingActions(get().pendingActionsWhenSigned.concat(action)),
			retrievePendingAction: (action: PendingAction) => {
				const {
					pendingActionsWhenSigned,
					setPendingActions: setPendingAction,
				} = get();
				const hasAction = pendingActionsWhenSigned.includes(action);
				if (hasAction)
					setPendingAction(without([action], pendingActionsWhenSigned));
				return hasAction;
			},
			resetPendingActions: () => get().setPendingActions([]),
		}),
		{
			name: "userSession",
		},
	),
);
