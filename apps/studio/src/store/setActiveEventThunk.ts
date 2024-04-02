import { createAsyncThunk } from "@reduxjs/toolkit";
import jscodeshift from "jscodeshift";
import { type OffsetRange } from "~/schemata/offsetRangeSchemata";
import { type AppDispatch, type RootState } from "~/store";
import { useLogStore } from "~/store/zustand/log";
import { parseSnippet } from "~/utils/babelParser";
import { isNeitherNullNorUndefined } from "~/utils/isNeitherNullNorUndefined";
import { type RangeCommand } from "~/utils/tree";
import { executeRangeCommandOnBeforeInputThunk } from "./executeRangeCommandOnBeforeInputThunk";
import { codemodOutputSlice } from "./slices/codemodOutput";
import { setCodemodSelection } from "./slices/mod";
import { setOutputSelection } from "./slices/snippets";

const alphanumerizeString = (input: string): string => {
	let output = "";

	// eslint-disable-next-line no-restricted-syntax
	for (const character of input) {
		if (!character.match(/[a-zA-Z0-9]/)) {
			// eslint-disable-next-line no-continue
			continue;
		}

		output += character;
	}

	return output;
};

const buildPhrasesUsingTokens = (snippet: string): ReadonlyArray<string> => {
	const parseResult = parseSnippet(snippet);

	const tokens =
		parseResult !== null && "tokens" in parseResult
			? parseResult.tokens ?? []
			: [];

	return tokens
		.map((token) => {
			if (token === null) {
				return null;
			}

			if ("value" in token) {
				const { value } = token;

				if (typeof value === "string") {
					return value;
				}
			}

			if ("type" in token) {
				const { type } = token;

				if (typeof type !== "object" || type === null) {
					return null;
				}

				const { label } = type;

				return typeof label === "string" && label !== "eof" && label !== ";"
					? label
					: null;
			}

			return null;
		})
		.filter(isNeitherNullNorUndefined);
};

const buildPhrasesUsingIdentifiers = (
	snippet: string,
): ReadonlyArray<string> => {
	const j = jscodeshift.withParser("tsx");
	const root = j(snippet);

	return root
		.find(j.Identifier)
		.paths()
		.filter((path, i, array) => {
			if (i === 0) {
				return true;
			}

			const previousPath = array[i - 1];

			return previousPath?.value.name !== path.value.name;
		})
		.map((path) => alphanumerizeString(path.value.name));
};

const calculateReplacementRanges = (
	output: string | null | undefined,
	replacedSnippets: ReadonlyArray<string>,
): ReadonlyArray<OffsetRange> => {
	if (!output || replacedSnippets.length === 0) {
		return [];
	}
	try {
		const replacementOffsetRanges: OffsetRange[] = [];

		replacedSnippets.forEach((snippet) => {
			let phrases = buildPhrasesUsingTokens(snippet);

			if (phrases.length === 0) {
				phrases = buildPhrasesUsingIdentifiers(snippet);
			}

			if (phrases.length === 0) {
				return;
			}

			const regex = new RegExp(phrases.join(".*?"), "gs");

			// eslint-disable-next-line no-restricted-syntax
			for (const regExpMatchArray of output.matchAll(regex)) {
				const start = regExpMatchArray.index ?? 0;
				const end = start + regExpMatchArray[0].length;

				replacementOffsetRanges.push({
					start,
					end,
				});
			}
		});

		return replacementOffsetRanges;
	} catch (error) {
		console.error(error);

		return [];
	}
};

export const setActiveEventThunk = createAsyncThunk<
	void,
	string | null,
	{
		dispatch: AppDispatch;
		state: RootState;
	}
>("thunks/setActiveEventThunk", async (eventHashDigest, thunkAPI) => {
	const { getState, dispatch } = thunkAPI;
	const { setActiveEventHashDigest, events } = useLogStore();

	if (eventHashDigest === null) {
		const rangeCommand: RangeCommand = {
			kind: "PASS_THROUGH",
			ranges: [],
		};

		dispatch(setCodemodSelection(rangeCommand));
		dispatch(executeRangeCommandOnBeforeInputThunk(rangeCommand));
		dispatch(setOutputSelection(rangeCommand));
		dispatch(codemodOutputSlice.actions.setSelections(rangeCommand));

		return;
	}

	const state = getState();

	const event =
		events.find(({ hashDigest }) => hashDigest === eventHashDigest) ?? null;

	if (event === null) {
		return;
	}

	setActiveEventHashDigest(eventHashDigest);

	dispatch(
		setCodemodSelection({
			kind: "PASS_THROUGH",
			ranges: [event.codemodSourceRange],
		}),
	);

	dispatch(
		executeRangeCommandOnBeforeInputThunk({
			// the selection from the evens will thus be reflected in the Find & Replace panel
			kind: "FIND_CLOSEST_PARENT",
			ranges: "snippetBeforeRanges" in event ? event.snippetBeforeRanges : [],
		}),
	);
	dispatch(
		setOutputSelection({
			kind: "PASS_THROUGH",
			ranges: [],
		}),
	);
	dispatch(
		codemodOutputSlice.actions.setSelections({
			kind: "PASS_THROUGH",
			ranges: calculateReplacementRanges(
				state.codemodOutput.content ?? "",
				"codes" in event ? event.codes : [],
			),
		}),
	);
});
