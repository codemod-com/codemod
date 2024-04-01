import create from "zustand";
import type { Event } from "~/schemata/eventSchemata";

type LogState = {
	events: ReadonlyArray<Event>;
	activeEventHashDigest: string | null;
	executionErrorUpdateAt: number;
	setEvents: (events: Event[]) => void;
	setActiveEventHashDigest: (hashDigest: string | null) => void;
	selectActiveEvent: () => Event | null;
};

const useLogStore = create<LogState>((set, get) => ({
	events: [],
	activeEventHashDigest: null,
	executionErrorUpdateAt: Date.now(),

	setEvents: (events) => {
		const executionErrorExists = events.some(
			(e) => e.kind === "codemodExecutionError",
		);
		set((state) => ({
			...state,
			events,
			executionErrorUpdateAt: executionErrorExists
				? Date.now()
				: state.executionErrorUpdateAt,
		}));
	},

	setActiveEventHashDigest: (hashDigest) => {
		set((state) => ({ ...state, activeEventHashDigest: hashDigest }));
	},

	selectActiveEvent: () => {
		// Assuming you have a way to access or pass the activeTab state
		// If the logic for determining the activeTab is external, you might need to adjust this
		const { activeEventHashDigest, events } = get();
		return activeEventHashDigest
			? events.find(({ hashDigest }) => hashDigest === activeEventHashDigest) ||
					null
			: null;
	},
}));

export default useLogStore;
