export const singleQuotify = (str: string) => `'${str}'`;
export const doubleQuotify = (str: string) => `"${str}"`;
export const backtickify = (str: string) => `\`${str}\``;

export const buildCrossplatformArg = (str: string) => {
	const isWin = process.platform === "win32";
	// remove trailing "\"
	return isWin ? doubleQuotify(str.replace(/\\+$/, "")) : singleQuotify(str);
};

export const capitalize = (str: string): string => {
	if (!str) {
		return "";
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
};

// remove all special characters and whitespace
export const removeSpecialCharacters = (str: string) =>
	str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, "").replace(/\s/g, "");

export const removeLineBreaksAtStartAndEnd = (str: string) =>
	str
		.replace(/^\n+/, "") // remove all occurrences of `\n` at the start
		.replace(/\n+$/, ""); // remove all occurrences of `\n` at the end
