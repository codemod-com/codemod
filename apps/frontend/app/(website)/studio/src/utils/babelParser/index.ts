import { type ParseError, parse } from "@babel/parser";
import tsxParserOptions from "./parserOptions";

let parseCode = (code: string) => parse(code, tsxParserOptions);

type FileParseResult = ReturnType<typeof parseCode>;

let isParseError = (err: unknown): err is ParseError =>
  typeof err === "object" &&
  err !== null &&
  Object.hasOwn(err, "code") &&
  Object.hasOwn(err, "reasonCode");

let parseSnippet = (snippet: string) => {
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
