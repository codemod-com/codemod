/* eslint-disable import/prefer-default-export */
/* eslint-disable max-classes-per-file */
class CodemodRuntimeFailureError extends Error {
	constructor() {
		// @TODO better description
		super('Codemod has runtime errors');
	}
}

export { CodemodRuntimeFailureError };
