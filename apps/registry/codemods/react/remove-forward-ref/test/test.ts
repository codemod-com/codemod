import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react/remove-forward-ref", () => {
	it("Unwraps the render function: render function is ArrowFunctionExpression", () => {
		const INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef((props, ref) => {
					return null;
			});
		`;

		const OUTPUT = `
			const MyInput = props => {
				const { ref } = props;
				return null;
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("Unwraps the render function: render function is FunctionExpression", () => {
		const INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function A(props, ref) {
					return null;
			});
		`;

		const OUTPUT = `
			const MyInput = function A(props) {
				const { ref } = props;
				return null;
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("forwardRef import: removes the import when only forwardRef is a single specifier", () => {
		const INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return null;
			});
		`;

		const OUTPUT = `
			const MyInput = function MyInput(props) {
				const { ref } = props;
				return null;
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("forwardRef import: removes forwardRef specifier", () => {
		const INPUT = `
			import { forwardRef, useState } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return null;
			});
		`;

		const OUTPUT = `
		    import { useState } from 'react';
			const MyInput = function MyInput(props) {
				const { ref } = props;
				return null;
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("Replaces the second arg of the render function: props are ObjectPattern", () => {
		const INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function MyInput({ onChange }, ref) {
					return <input ref={ref} onChange={onChange} />
			});
		`;

		const OUTPUT = `
			const MyInput = function MyInput({ ref, onChange }) {
				return <input ref={ref} onChange={onChange} />
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("Replaces the second arg of the render function: props are Identifier", () => {
		const INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return <input ref={ref} onChange={props.onChange} />
			});
		`;

		const OUTPUT = `
			const MyInput = function MyInput(props) {
				const { ref } = props;
				return <input ref={ref} onChange={props.onChange} />
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});

	it("Typescript: reuses forwardRef typeArguments", () => {
		const INPUT = `
			import { forwardRef } from 'react';
			type Props = { a: 1 };
			
			const MyInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
					return null;
			});
		`;

		const OUTPUT = `
			type Props = { a: 1 };
			const MyInput = (props: Props & { ref: React.RefObject<HTMLInputElement>; }) => {
				const { ref } = props;
				return null;
			};
		`;

		const fileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));
		console.log(actualOutput, "???");
		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ""),
			OUTPUT.replace(/\s/gm, ""),
		);
	});
});
