import {
	type Output,
	array,
	literal,
	nullable,
	object,
	string,
	union,
} from "valibot";

import { uniq, without } from "ramda";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ToVoid } from "../../types/transformations";

export const userSessionSchema = object({
	pendingActionsWhenSigned: array(union([literal("openRepoModal")])),
	codemodExecutionId: union([nullable(string())]),
});

type UserSession = Output<typeof userSessionSchema>;

export const Actions = ["openRepoModal"];

export type PendingAction = UserSession["pendingActionsWhenSigned"][number];

export type UserSessionStore = UserSession & {
	setPendingActions: ToVoid<PendingAction[]>;
	setCodemodExecutionId: ToVoid<string | null>;
	addPendingActionsWhenSigned: ToVoid<PendingAction>;
	retrievePendingAction: (action: PendingAction) => boolean;
	hasPendingAction: (action: PendingAction) => boolean;
	resetPendingActions: VoidFunction;
};

const buildDefaultUserSession = (): UserSession => ({
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
