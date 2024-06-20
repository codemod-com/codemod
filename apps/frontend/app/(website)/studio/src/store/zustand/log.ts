import type { Event } from "@studio/schemata/eventSchemata";
import create from "zustand";
import { TabNames, useViewStore } from "./view";

type LogState = {
  events: ReadonlyArray<Event>;
  activeEventHashDigest: string | null;
  executionErrorUpdateAt: number;
  setEvents: (events: ReadonlyArray<Event>) => void;
  setActiveEventHashDigest: (hashDigest: string | null) => void;
};

export let useLogStore = create<LogState>((set, get) => ({
  events: [],
  activeEventHashDigest: null,
  executionErrorUpdateAt: Date.now(),
  setEvents: (events) => {
    let executionErrorExists =
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

export let useSelectActiveEvent = () => {
  let { activeEventHashDigest, events } = useLogStore();
  let { activeTab } = useViewStore();

  if (activeTab !== TabNames.DEBUG || activeEventHashDigest === null) {
    return null;
  }

  return (
    events.find(({ hashDigest }) => hashDigest === activeEventHashDigest) ??
    null
  );
};

export let useCodemodExecutionError = (): string | null => {
  let { events } = useLogStore();
  return (
    events.find(
      (e): e is Event & { kind: "codemodExecutionError" } =>
        e.kind === "codemodExecutionError",
    )?.message ?? null
  );
};
