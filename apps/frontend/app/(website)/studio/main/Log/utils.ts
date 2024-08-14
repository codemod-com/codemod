import type { Event } from "@studio/schemata/eventSchemata";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";

const eventKindToRowName: Record<string, string> = {
  collectionFind: "Found Collection",
  collectionPaths: "Found Paths",
  collectionRemove: "Removed Collection",
  collectionReplace: "Replaced Collection",
  collectionToSource: "Built Source from Collection",
  path: "Replaced Path(s)",
  pathReplace: "Replaced Path(s)",
  jscodeshiftApplyString: "Created Root Collection",
  printedMessage: "Printed Message",
  codemodExecutionError: "Codemod Execution Error",
};

export const getTableRowName = (event: Event): string => {
  if (event.kind === "path" && event.mode === "lookup") {
    return "Accessed Path(s)";
  }
  return eventKindToRowName[event.kind] || "Unknown Event";
};

const detailGetters: Record<string, (event: Event) => string> = {
  nodeType: (event) => (event.nodeType ? `Node Type: ${event.nodeType}` : ""),
  snippetBeforeRanges: (event) =>
    event.snippetBeforeRanges
      ? `Node Count: ${event.snippetBeforeRanges.length}`
      : "",
  message: (event) => (event.message ? `Message: ${event.message}` : ""),
  mode: (event) => (event.mode ? `Mode: ${event.mode}` : ""),
  stack: (event) => (event.stack ? `Stack: ${event.stack}` : ""),
  codes: (event) => (event.codes ? `Codes: ${event.codes.length}` : ""),
};

export const getTableRowDetails = (event: Event): string[] =>
  Object.entries(detailGetters)
    .map(([key, getter]) => getter(event))
    .filter(Boolean);

export const buildTableRow = (
  event: Event,
  eventHashDigest: string | null,
  index: number,
) => ({
  index,
  hashDigest: event.hashDigest,
  className: event.hashDigest === eventHashDigest ? "highlight" : "",
  name: getTableRowName(event),
  details: getTableRowDetails(event),
});

export const useRanges = () => ({
  codemodInputRanges: useModStore().ranges,
  codemodOutputRanges: useSnippetsStore().getSelectedEditors().output.ranges,
  beforeInputRanges: useSnippetsStore().getSelectedEditors().before.ranges,
  afterInputRanges: useSnippetsStore().getSelectedEditors().after.ranges,
});
