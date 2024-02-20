import * as estreePlugin from "prettier/plugins/estree";
import * as tsPlugin from "prettier/plugins/typescript";
import * as prettier from "prettier/standalone";

// Prettier is temporarily excluded, due to switching its API to async after upgrading to v3
const prettifyDeprecated = (text: string): string => {
	if (prettier === undefined || tsPlugin === undefined) {
		return text;
	}

	try {
		return text;
	} catch (error) {
		console.error(error);

		return text;
	}
};

export const prettify = async (text: string): Promise<string> => {
	if (prettier === undefined || tsPlugin === undefined) {
		return text;
	}

	try {
		return prettier.format(text, {
			semi: true,
			singleQuote: true,
			jsxSingleQuote: true,
			trailingComma: "all",
			parser: "typescript",
			tabWidth: 4,
			plugins: [tsPlugin, estreePlugin],
		});
	} catch (error) {
		console.error(error);

		return text;
	}
};

export default prettifyDeprecated;
