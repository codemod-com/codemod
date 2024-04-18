export const redactFilePaths = (input: string): string => {
	// Regular expression to match file paths
	const filePathRegex = /(?:\/[^\/\s]+\s*)+[\/]?/g;

	// Replace file paths with "REDACTED-FILE-PATH"
	return input.replace(filePathRegex, "REDACTED-FILE-PATH");
};
