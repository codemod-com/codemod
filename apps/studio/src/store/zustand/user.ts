import { without } from "ramda";
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
};

export const useUserState = create<UserState>((set, get) => ({
	pendingActionsWhenSigned: isServer
		? []
		: (JSON.parse(
				localStorage.getItem("pendingActionsWhenSigned") || "[]",
		  ) as string[]),
	setPendingAction: (actions: PendingAction[]) => {
		console.log("arbuz");
		set({ pendingActionsWhenSigned: actions });
		if (!isServer)
			localStorage.setItem("pendingActionsWhenSigned", JSON.stringify(actions));
	},
	addPendingActionsWhenSigned: (action: PendingAction) =>
		get().setPendingAction(get().pendingActionsWhenSigned.concat(action)),
	retrievePendingAction: (action: PendingAction) => {
		const { pendingActionsWhenSigned, setPendingAction } = get();
		const hasAction = pendingActionsWhenSigned.includes(action);
		if (hasAction)
			setPendingAction(without([action], pendingActionsWhenSigned));
		return hasAction;
	},
}));
