export let singleQuotify = (str: string) => `'${str}'`;
export let doubleQuotify = (str: string) => `"${str}"`;
export let backtickify = (str: string) => `\`${str}\``;

export let buildCrossplatformArg = (str: string) => {
	let isWin = process.platform === 'win32';
	// remove trailing "\"
	return isWin ? doubleQuotify(str.replace(/\\+$/, '')) : singleQuotify(str);
};

export let capitalize = (str: string): string => {
	if (!str) {
		return '';
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
};

// remove all special characters and whitespace
export let removeSpecialCharacters = (str: string) =>
	str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, '').replace(/\s/g, '');

export let removeLineBreaksAtStartAndEnd = (str: string) =>
	str
		.replace(/^\n+/, '') // remove all occurrences of `\n` at the start
		.replace(/\n+$/, ''); // remove all occurrences of `\n` at the end
