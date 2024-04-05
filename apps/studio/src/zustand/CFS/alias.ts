import { useCodemodExecutionError } from "~/zustand/stores/log";
import { useModStore } from "~/zustand/stores/mod";
import { useSnippetStore } from "~/zustand/stores/snippets";

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

export const useGetAliases = () => {
	const codemodExecutionError = useCodemodExecutionError();
	const {
		internalContent,
		ranges: codemodInputRanges,
		rangesUpdatedAt,
	} = useModStore.getState();

	const {
		beforeSnippetText,
		afterSnippetText,
		afterSnippetSelectionRanges,
		afterRangeUpdatedAt,
		beforeSnippetSelectionRanges,
		beforeRangeUpdatedAt,
	} = useSnippetStore.getState();

	return {
		$CODEMOD: { value: internalContent ?? "", updatedAt: -1 },
		$HIGHLIGHTED_IN_CODEMOD:
			codemodInputRanges[0] && internalContent !== null
				? {
						value: internalContent.slice(
							codemodInputRanges[0].start,
							codemodInputRanges[0].end,
						),
						updatedAt: rangesUpdatedAt,
				  }
				: null,
		$BEFORE: { value: beforeSnippetText, updatedAt: -1 },
		$AFTER: { value: afterSnippetText, updatedAt: -1 },
		$HIGHLIGHTED_IN_BEFORE: beforeSnippetSelectionRanges[0]
			? {
					value: beforeSnippetText.slice(
						beforeSnippetSelectionRanges[0].start,
						beforeSnippetSelectionRanges[0].end,
					),
					updatedAt: beforeRangeUpdatedAt,
			  }
			: null,
		$HIGHLIGHTED_IN_AFTER: afterSnippetSelectionRanges[0]
			? {
					value: afterSnippetText.slice(
						afterSnippetSelectionRanges[0].start,
						afterSnippetSelectionRanges[0].end,
					),
					updatedAt: afterRangeUpdatedAt,
			  }
			: null,
		$EXECUTION_ERROR: {
			value: codemodExecutionError ?? "",
			updatedAt: rangesUpdatedAt,
		},
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
