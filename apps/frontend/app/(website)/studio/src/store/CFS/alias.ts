import { useCodemodExecutionError } from "@studio/store/log";
import { useModStore } from "@studio/store/mod";
import { useSnippetsStore } from "../snippets";

export type AliasName =
  | "$CODEMOD"
  | "$HIGHLIGHTED_IN_CODEMOD"
  | "$BEFORE"
  | "$AFTER"
  | "$HIGHLIGHTED_IN_BEFORE"
  | "$HIGHLIGHTED_IN_AFTER"
  | "$EXECUTION_ERROR";

export type Aliases = Record<
  AliasName,
  { value: string; updatedAt: number } | null
>;

export const useGetAliases = (): Aliases => {
  const codemodExecutionError = useCodemodExecutionError();
  const {
    content,
    ranges: codemodInputRanges,
    rangesUpdatedAt,
  } = useModStore();

  const { getSelectedEditors, getAllSnippets } = useSnippetsStore();

  const {
    after: { ranges: afterInputRanges, rangeUpdatedAt: afterRangeUpdatedAt },
    before: { ranges: beforeInputRanges, rangeUpdatedAt: beforeRangeUpdatedAt },
  } = getSelectedEditors();

  const { before, after } = getAllSnippets();

  const inputSnippet = before.join(" ");
  const afterSnippet = after.join(" ");

  return {
    $CODEMOD: { value: content ?? "", updatedAt: -1 },
    $HIGHLIGHTED_IN_CODEMOD:
      codemodInputRanges[0] && content !== null
        ? {
            value: content.slice(
              codemodInputRanges[0].start,
              codemodInputRanges[0].end,
            ),
            updatedAt: rangesUpdatedAt,
          }
        : null,
    $BEFORE: { value: inputSnippet, updatedAt: -1 },
    $AFTER: { value: afterSnippet, updatedAt: -1 },
    $HIGHLIGHTED_IN_BEFORE: beforeInputRanges[0]
      ? {
          value: inputSnippet.slice(
            beforeInputRanges[0].start,
            beforeInputRanges[0].end,
          ),
          updatedAt: beforeRangeUpdatedAt,
        }
      : null,
    $HIGHLIGHTED_IN_AFTER: afterInputRanges[0]
      ? {
          value: afterSnippet.slice(
            afterInputRanges[0].start,
            afterInputRanges[0].end,
          ),
          updatedAt: afterRangeUpdatedAt,
        }
      : null,
    $EXECUTION_ERROR: codemodExecutionError
      ? {
          value: codemodExecutionError,
          updatedAt: rangesUpdatedAt,
        }
      : null,
  };
};

export const applyAliases = (
  message: string,
  variables: Record<string, { value: string } | null>,
): string => {
  const METAVARIABLE_REGEX = /\$\w+/g;

  return message.replace(METAVARIABLE_REGEX, (metavar) => {
    const metavarValue = variables[metavar]?.value ?? "";

    return `
			\`\`\`
			${metavarValue}
			\`\`\`
			`;
  });
};
