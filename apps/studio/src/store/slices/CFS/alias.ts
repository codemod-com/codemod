import type { RootState } from '../..';
import { type Event } from '../log';
import { selectIndividualSnippet } from '../snippets';
import { selectActiveSnippet } from '../view';

type AliasName =
	| '$CODEMOD'
	| '$HIGHLIGHTED_IN_CODEMOD'
	| '$BEFORE'
	| '$AFTER'
	| '$HIGHLIGHTED_IN_BEFORE'
	| '$HIGHLIGHTED_IN_AFTER'
	| '$EXECUTION_ERROR';

type Aliases = Record<AliasName, { value: string; updatedAt: number } | null>;

const getAliases = (state: RootState): Aliases => {
	const activeSnippet = selectActiveSnippet(state);
	const currentSnippet = selectIndividualSnippet(activeSnippet)(state);
	const {
		internalContent,
		ranges: codemodInputRanges,
		rangesUpdatedAt,
	} = state.mod;

	const {
		inputSnippet,
		outputSnippet,
		afterInputRanges,
		afterRangeUpdatedAt,
		beforeInputRanges,
		beforeRangeUpdatedAt,
	} = currentSnippet!;

	const codemodExecutionError =
		state.log.events.find(
			(e): e is Event & { kind: 'codemodExecutionError' } =>
				e.kind === 'codemodExecutionError',
		)?.message ?? null;

	return {
		$CODEMOD: { value: internalContent ?? '', updatedAt: -1 },
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
		$BEFORE: { value: inputSnippet, updatedAt: -1 },
		$AFTER: { value: outputSnippet, updatedAt: -1 },
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
					value: outputSnippet.slice(
						afterInputRanges[0].start,
						afterInputRanges[0].end,
					),
					updatedAt: afterRangeUpdatedAt,
			  }
			: null,
		$EXECUTION_ERROR: {
			value: codemodExecutionError ?? '',
			updatedAt: rangesUpdatedAt,
		},
	};
};

const applyAliases = (
	message: string,
	variables: Record<string, { value: string } | null>,
): string => {
	const METAVARIABLE_REGEX = /\$\w+/g;

	return message.replace(METAVARIABLE_REGEX, (metavar) => {
		const metavarValue = variables[metavar]?.value ?? '';

		return `
			\`\`\`
			${metavarValue}
			\`\`\`
			`;
	});
};

export { applyAliases, getAliases };

export type { AliasName, Aliases };
