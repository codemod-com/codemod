class CodemodRuntimeFailureError extends Error {
	constructor() {
		// @TODO better description
		super("Codemod has runtime errors");
	}
}

export { CodemodRuntimeFailureError };
