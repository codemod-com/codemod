import { parse, type ParseError } from "@babel/parser";
import type * as BabelTypes from "@babel/types";
import tsxParserOptions from "./parserOptions";

const parseCode = (code: string) => parse(code, tsxParserOptions);

type FileParseResult = ReturnType<typeof parseCode>;

function isFileParseResult(
	value: FileParseResult | ParseError | null,
): value is FileParseResult {
	return value !== null && "type" in value;
}

const isParseError = (err: unknown): err is ParseError =>
	typeof err === "object" &&
	err !== null &&
	Object.hasOwn(err, "code") &&
	Object.hasOwn(err, "reasonCode");

const parseSnippet = (snippet: string) => {
	if (snippet.trim() === "") {
		return null;
	}
	try {
		return parseCode(snippet);
	} catch (err) {
		if (isParseError(err)) {
			return { ...err } as ParseError;
		}
		return null;
	}
};

const isParsedResultFile = (
	val: null | ParseError | BabelTypes.File,
): val is BabelTypes.File => val !== null && "type" in val && "program" in val;

export {
	parseCode,
	isParseError,
	parseSnippet,
	isParsedResultFile,
	isFileParseResult,
};
export type { FileParseResult, ParseError };
