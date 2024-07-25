import type { Event } from "@studio/schemata/eventSchemata";
import { create } from "zustand";
import { TabNames, useViewStore } from "./view";

type LogState = {
  executionErrors: ReadonlyArray<Event>;
  events: ReadonlyArray<Event>;
  consoleLogs: ReadonlyArray<Event>;
  restEvents: ReadonlyArray<Event>;
  activeEventHashDigest: string | null;
  executionErrorUpdateAt: number;
  setEvents: (events: ReadonlyArray<Event>) => void;
  setActiveEventHashDigest: (hashDigest: string | null) => void;
};

export const specialEvents = ["codemodExecutionError", "printedMessage"];
export const eventsToSkip = ["collectionFind"];
export const useLogStore = create<LogState>((set, get) => ({
  events: [],
  executionErrors: [],
  restEvents: [],
  activeEventHashDigest: null,
  executionErrorUpdateAt: Date.now(),
  setEvents: (events) => {
    const executionErrors = events.filter(
      (e) => e.kind === "codemodExecutionError",
    );
    const consoleLogs = events.filter((e) => e.kind === "printedMessage");
    const restEvents = events.filter(
      (e) => !specialEvents.concat(eventsToSkip).includes(e.kind),
    );
    console.log({ restEvents });
    const executionErrorExists = !!executionErrors.length;
    set((state) => ({
      events,
      consoleLogs,
      restEvents,
      executionErrors,
      executionErrorUpdateAt: executionErrorExists
        ? Date.now()
        : state.executionErrorUpdateAt,
    }));
  },
  setActiveEventHashDigest: (hashDigest) => {
    set(() => ({
      activeEventHashDigest: hashDigest,
    }));
  },
}));

export const useSelectActiveEvent = () => {
  const { activeEventHashDigest, events } = useLogStore();
  const { activeTab } = useViewStore();

  if (activeTab !== TabNames.DEBUG || activeEventHashDigest === null) {
    return null;
  }

  return (
    events.find(({ hashDigest }) => hashDigest === activeEventHashDigest) ??
    null
  );
};

export const useCodemodExecutionError = (): string | null => {
  const { events } = useLogStore();
  return (
    events.find(
      (e): e is Event & { kind: "codemodExecutionError" } =>
        e.kind === "codemodExecutionError",
    )?.message ?? null
  );
};
