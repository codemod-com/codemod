export const capitalizeWord = (str: string): string => {
	if (str.length === 0) {
		return str;
	}

	const firstLetter = str[0]?.toUpperCase();
	const restOfWord = str.slice(1).toLowerCase();

	return firstLetter + restOfWord;
};
