import type { Event } from "@studio/schemata/eventSchemata";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "@studio/store/snippets";

export const getTableRowName = (event: Event): string => {
  switch (event.kind) {
    case "collectionFind":
      return "Found Collection";
    case "collectionPaths":
      return "Found Paths";
    case "collectionRemove":
      return "Removed Collection";
    case "collectionReplace":
      return "Replaced Collection";
    case "collectionToSource":
      return "Built Source from Collection";
    case "path": {
      if (event.mode === "lookup") {
        return "Accessed Path(s)";
      }
      return "Replaced Path(s)";
    }
    case "pathReplace":
      return "Replaced Path(s)";
    case "jscodeshiftApplyString":
      return "Created Root Collection";
    case "printedMessage":
      return "Printed Message";
    case "codemodExecutionError":
      return "Codemod Execution Error";
    default:
      return "Unknown Event";
  }
};

export const getTableRowDetails = (event: Event) => {
  const res: string[] = [];

  if ("nodeType" in event) {
    res.push(`Node Type: ${event.nodeType}`);
  }

  if ("snippetBeforeRanges" in event) {
    res.push(`Node Count: ${event.snippetBeforeRanges.length}`);
  }

  if ("message" in event) {
    res.push(`Message: ${event.message}`);
  }

  return res;
};

export const buildTableRow = (
  event: Event,
  eventHashDigest: string | null,
  index: number,
): TableRow => ({
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
