import { tsx as astGrepTsx } from "@ast-grep/napi";

export const js = (code: TemplateStringsArray) => {
	const astGrep = (grep: TemplateStringsArray) => {
		const ast = astGrepTsx.parse(code.join(""));
		const root = ast.root();
		const node = root.find(grep.join(""));

		const replaceWith = (replacement: TemplateStringsArray) => {
			const joinedCode = code.join("");
			if (node) {
				const text = replacement
					.join("")
					.replace(/(\$\$)?\$([A-Z]+)/, (match, isMultiMatch, varName) => {
						if (isMultiMatch) {
							return node
								?.getMultipleMatches(varName)
								.map((n) => n.text())
								.join(" ");
						}

						return node?.getMatch(varName)?.text() || "";
					});
				return (
					joinedCode.substring(0, node?.range().start.index) +
					text +
					joinedCode.substring(node?.range().end.index || 0)
				);
			}

			return joinedCode;
		};

		const astGrepParams = { node, replaceWith };

		const astGrepCallback = (
			innerCallback: (args: typeof astGrepParams) => void,
		) => innerCallback(astGrepParams);

		astGrepCallback.node = node;
		astGrepCallback.replaceWith = replaceWith;

		return astGrepCallback;
	};

	const params = { astGrep };

	const callback = (innerCallback: (args: typeof params) => void) =>
		innerCallback(params);

	callback.astGrep = astGrep;

	return callback;
};
