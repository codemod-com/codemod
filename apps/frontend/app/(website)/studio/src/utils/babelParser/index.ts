import { parse, type ParseError } from "@babel/parser";
import tsxParserOptions from "./parserOptions";

const parseCode = (code: string) => parse(code, tsxParserOptions);

type FileParseResult = ReturnType<typeof parseCode>;

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

export { parseCode, isParseError, parseSnippet };
export type { FileParseResult, ParseError };
