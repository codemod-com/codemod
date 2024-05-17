import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-redux-8 add-state-type', () => {
	it('should add the State type for state parameter of the mapStateToProps arrow function', () => {
		let INPUT = `
            const mapStateToProps = (state) => ({
                a: selectA(state),
            });
        `;

		let OUTPUT = `
			import { State } from "state";

			const mapStateToProps = (state: State) => ({
                a: selectA(state),
            });
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state destructured parameter of the mapStateToProps arrow function', () => {
		let INPUT = `
            const mapStateToProps = ({ a }) => ({
                a,
            });
        `;

		let OUTPUT = `
			import { State } from "state";

			const mapStateToProps = ({ a }: State) => ({
                a,
            });
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the mapStateToProps function', () => {
		let INPUT = `
			function mapStateToProps (a) {
				return {
					a
				}
			}
        `;

		let OUTPUT = `
			import { State } from "state";

			function mapStateToProps (a: State) {
				return {
					a
				}
			}
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state destructured parameter of the mapStateToProps function', () => {
		let INPUT = `
			function mapStateToProps ({ a }) {
				return {
					a
				}
			}
        `;

		let OUTPUT = `
			import { State } from "state";

			function mapStateToProps ({ a }: State) {
				return {
					a
				}
			}
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the mapDispatchToProps arrow function', () => {
		let INPUT = `
            const mapDispatchToProps = (dispatch) => ({
                onA: (a) => dispatch(a),
            });
        `;

		let OUTPUT = `
			import { ThunkDispatch } from "redux-thunk";
			import { State } from "state";

			const mapDispatchToProps = (dispatch: ThunkDispatch<State, any, any>) => ({
                onA: (a) => dispatch(a),
            });
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the mapDispatchToProps arrow function', () => {
		let INPUT = `
            function mapDispatchToProps (dispatch) {
				return {
					onA: (a) => dispatch(a),
				}
            };
        `;

		let OUTPUT = `
			import { ThunkDispatch } from "redux-thunk";
			import { State } from "state";

			function mapDispatchToProps (dispatch: ThunkDispatch<State, any, any>) {
				return {
					onA: (a) => dispatch(a),
				}
            };
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the mapStateToProps and the mapDispatchToProps arrow function', () => {
		let INPUT = `
			function mapStateToProps (state) {
				return {
					...state
				}
			}

            function mapDispatchToProps (dispatch) {
				return {
					onA: (a) => dispatch(a),
				}
            };
        `;

		let OUTPUT = `
			import { ThunkDispatch } from "redux-thunk";
			import { State } from "state";

			function mapStateToProps (state: State) {
				return {
					...state
				}
			}

			function mapDispatchToProps (dispatch: ThunkDispatch<State, any, any>) {
				return {
					onA: (a) => dispatch(a),
				}
            };
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the mapStateToProps and the mapDispatchToProps function', () => {
		let INPUT = `
			const mapStateToProps = (state) => {
				return {
					...state
				}
			}

            const mapDispatchToProps = (dispatch) => {
				return {
					onA: (a) => dispatch(a),
				}
            };
        `;

		let OUTPUT = `
			import { ThunkDispatch } from "redux-thunk";
			import { State } from "state";

			const mapStateToProps = (state: State) => {
				return {
					...state
				}
			}

			const mapDispatchToProps = (dispatch: ThunkDispatch<State, any, any>) => {
				return {
					onA: (a) => dispatch(a),
				}
            };
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the select function', () => {
		let INPUT = `
			function selectX (state) {
				return {
					...state
				}
			}
        `;

		let OUTPUT = `
			import { State } from "state";
			
			function selectX (state: State) {
				return {
					...state
				}
			}
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should add the State type for state parameter of the select function', () => {
		let INPUT = `
			const selectX = (state) => {
				return {
					...state
				}
			}
        `;

		let OUTPUT = `
			import { State } from "state";
			
			const selectX = (state: State) => {
				return {
					...state
				}
			}
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
