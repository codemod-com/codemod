import { uniq, without } from "ramda";
import create from "zustand";
import { isServer } from "~/config";
import { ToVoid } from "~/types/transformations";

export const Actions = ["openRepoModal"];

export type PendingAction = (typeof Actions)[number];
export type UserState = {
	pendingActionsWhenSigned: PendingAction[];
	setPendingAction: ToVoid<PendingAction[]>;
	addPendingActionsWhenSigned: ToVoid<PendingAction>;
	retrievePendingAction: (action: PendingAction) => boolean;
	hasPendingAction: (action: PendingAction) => boolean;
	reset: VoidFunction;
};

export const usePendingActionsOnSignInStore = create<UserState>((set, get) => ({
	pendingActionsWhenSigned: isServer
		? []
		: (JSON.parse(
				localStorage.getItem("pendingActionsWhenSigned") || "[]",
		  ) as string[]),
	setPendingAction: (actions: PendingAction[]) => {
		const uniqActions = uniq(actions);
		set({ pendingActionsWhenSigned: uniqActions });
		if (!isServer)
			localStorage.setItem(
				"pendingActionsWhenSigned",
				JSON.stringify(uniqActions),
			);
	},
	hasPendingAction: (action: PendingAction) =>
		get().pendingActionsWhenSigned.includes(action),
	addPendingActionsWhenSigned: (action: PendingAction) =>
		get().setPendingAction(get().pendingActionsWhenSigned.concat(action)),
	retrievePendingAction: (action: PendingAction) => {
		const { pendingActionsWhenSigned, setPendingAction } = get();
		const hasAction = pendingActionsWhenSigned.includes(action);
		if (hasAction)
			setPendingAction(without([action], pendingActionsWhenSigned));
		return hasAction;
	},
	reset: () => get().setPendingAction([]),
}));
