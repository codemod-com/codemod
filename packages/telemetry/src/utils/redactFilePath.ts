export let redactFilePaths = (input: string): string => {
	// Regular expression to match file paths
	let filePathRegex = /(?:\/[^\/\s]+\s*)+[\/]?/g;

	// Replace file paths with "REDACTED-FILE-PATH"
	return input.replace(filePathRegex, 'REDACTED-FILE-PATH');
};
