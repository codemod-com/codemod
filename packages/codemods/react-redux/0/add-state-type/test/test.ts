import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-redux-8 add-state-type", () => {
  it("should add the State type for state parameter of the mapStateToProps arrow function", () => {
    const INPUT = `
            const mapStateToProps = (state) => ({
                a: selectA(state),
            });
        `;

    const OUTPUT = `
			import { State } from "state";

			const mapStateToProps = (state: State) => ({
                a: selectA(state),
            });
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state destructured parameter of the mapStateToProps arrow function", () => {
    const INPUT = `
            const mapStateToProps = ({ a }) => ({
                a,
            });
        `;

    const OUTPUT = `
			import { State } from "state";

			const mapStateToProps = ({ a }: State) => ({
                a,
            });
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the mapStateToProps function", () => {
    const INPUT = `
			function mapStateToProps (a) {
				return {
					a
				}
			}
        `;

    const OUTPUT = `
			import { State } from "state";

			function mapStateToProps (a: State) {
				return {
					a
				}
			}
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state destructured parameter of the mapStateToProps function", () => {
    const INPUT = `
			function mapStateToProps ({ a }) {
				return {
					a
				}
			}
        `;

    const OUTPUT = `
			import { State } from "state";

			function mapStateToProps ({ a }: State) {
				return {
					a
				}
			}
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the mapDispatchToProps arrow function", () => {
    const INPUT = `
            const mapDispatchToProps = (dispatch) => ({
                onA: (a) => dispatch(a),
            });
        `;

    const OUTPUT = `
			import { ThunkDispatch } from "redux-thunk";
			import { State } from "state";

			const mapDispatchToProps = (dispatch: ThunkDispatch<State, any, any>) => ({
                onA: (a) => dispatch(a),
            });
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the mapDispatchToProps arrow function", () => {
    const INPUT = `
            function mapDispatchToProps (dispatch) {
				return {
					onA: (a) => dispatch(a),
				}
            };
        `;

    const OUTPUT = `
			import { ThunkDispatch } from "redux-thunk";
			import { State } from "state";

			function mapDispatchToProps (dispatch: ThunkDispatch<State, any, any>) {
				return {
					onA: (a) => dispatch(a),
				}
            };
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the mapStateToProps and the mapDispatchToProps arrow function", () => {
    const INPUT = `
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

    const OUTPUT = `
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

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the mapStateToProps and the mapDispatchToProps function", () => {
    const INPUT = `
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

    const OUTPUT = `
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

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the select function", () => {
    const INPUT = `
			function selectX (state) {
				return {
					...state
				}
			}
        `;

    const OUTPUT = `
			import { State } from "state";
			
			function selectX (state: State) {
				return {
					...state
				}
			}
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });

  it("should add the State type for state parameter of the select function", () => {
    const INPUT = `
			const selectX = (state) => {
				return {
					...state
				}
			}
        `;

    const OUTPUT = `
			import { State } from "state";
			
			const selectX = (state: State) => {
				return {
					...state
				}
			}
		`;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi("tsx"), {});

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
