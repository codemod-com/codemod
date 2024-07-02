import { parseSnippet } from "@studio/utils/babelParser";
import { isFile } from "@babel/types";
import mapBabelASTToRenderableTree from "@studio/utils/mappers";
import { SnippetValues } from "@studio/store/snippets";

export const BEFORE_SNIPPET_DEFAULT_CODE = `function mapStateToProps(state) {
    const { data } = state;
    return {
        data,
    };
}
 `;

export const AFTER_SNIPPET_DEFAULT_CODE = `function mapStateToProps(state: State) {
    const { data } = state;
    return {
        data,
    };
}
`;

export const getSnippetInitialState = (defaultContent: string | null = ""): SnippetValues => {
	const content = defaultContent ?? "";
	const contentParsed = parseSnippet(content);
	const rootNode = isFile(contentParsed)
		? mapBabelASTToRenderableTree(contentParsed)
		: null;

	const tokens: SnippetValues["tokens"] = isFile(contentParsed)
		? Array.isArray(contentParsed.tokens)
			? // @ts-ignore
			contentParsed.tokens.map(({ start, end, value }) => ({
				start,
				end,
				value: (value ?? "").slice(start, end),
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

export  const getSingleTestCase = () => ({
	name: 'Test 1',
	before: getSnippetInitialState(BEFORE_SNIPPET_DEFAULT_CODE),
	after: getSnippetInitialState(AFTER_SNIPPET_DEFAULT_CODE),
	output: getSnippetInitialState(),
})