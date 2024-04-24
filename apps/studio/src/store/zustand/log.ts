import { create } from "zustand";
import type { Event } from "~/schemata/eventSchemata";
import { TabNames, useViewStore } from "./view";

type LogState = {
  events: ReadonlyArray<Event>;
  activeEventHashDigest: string | null;
  executionErrorUpdateAt: number;
  setEvents: (events: ReadonlyArray<Event>) => void;
  setActiveEventHashDigest: (hashDigest: string | null) => void;
};

export const useLogStore = create<LogState>((set, get) => ({
  events: [],
  activeEventHashDigest: null,
  executionErrorUpdateAt: Date.now(),
  setEvents: (events) => {
    const executionErrorExists =
      events.find((e) => e.kind === "codemodExecutionError") !== undefined;
    set((state) => ({
      events,
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
