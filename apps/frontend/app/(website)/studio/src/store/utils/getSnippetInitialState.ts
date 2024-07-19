import { isFile } from "@babel/types";
import { transformNode } from "@studio/main/ASTViewer/utils";
import {
  AFTER_SNIPPET_DEFAULT_CODE,
  BEFORE_SNIPPET_DEFAULT_CODE,
} from "@studio/store/initialState";
import type { SnippetValues } from "@studio/store/snippets";
import { parseSnippet } from "@studio/utils/babelParser";

export const toInitialStates = ({ before, after, name }) => ({
  name,
  before: getSnippetInitialState(before),
  after: getSnippetInitialState(after),
  output: getSnippetInitialState(),
});

export const getSnippetInitialState = (
  defaultContent: string | null = "",
): SnippetValues => {
  const content = defaultContent ?? "";
  const contentParsed = parseSnippet(content);
  const rootNode = transformNode(contentParsed);

  const tokens: SnippetValues["tokens"] = isFile(contentParsed)
    ? Array.isArray(contentParsed.tokens)
      ? // @ts-ignore
        contentParsed.tokens.map(({ start, end, value }) => ({
          start,
          end,
          value: (value ?? "").toString().slice(start, end),
        }))
      : []
    : [];

  return {
    rootNode,
    ranges: [],
    content,
    tokens,
    rangeUpdatedAt: Date.now(),
  };
};

export const getSingleTestCase = (
  before = BEFORE_SNIPPET_DEFAULT_CODE,
  after = AFTER_SNIPPET_DEFAULT_CODE,
) => ({
  name: "Test 1",
  before: getSnippetInitialState(before),
  after: getSnippetInitialState(after),
  output: getSnippetInitialState(),
});

export const getEmptyTestCase = () => ({
  name: "Test 1",
  before: getSnippetInitialState(),
  after: getSnippetInitialState(),
  output: getSnippetInitialState(),
});
