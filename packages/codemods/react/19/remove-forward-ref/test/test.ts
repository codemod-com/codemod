import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react/remove-forward-ref", () => {
  it("Unwraps the render function: callee is member expression", () => {
    const INPUT = `
			import * as React1 from 'react';

			const MyInput = React1.forwardRef((props, ref) => {
					return null;
			});
		`;

    const OUTPUT = `
     import * as React1 from 'react';
     
			const MyInput = ({ ref, ...props }) => {
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

  it("Unwraps the render function: render function is ArrowFunctionExpression", () => {
    const INPUT = `
			import { forwardRef as forwardRef2 } from 'react';

			const MyInput = forwardRef2((props, ref) => {
					return null;
			});
		`;

    const OUTPUT = `
			const MyInput = ({ ref, ...props }) => {
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
			const MyInput = function A({ref, ...props}) {
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
			const MyInput = function MyInput({ref, ...props}) {
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

  it("forwardRef import: should not remove type imports", () => {
    const INPUT = `
			import { forwardRef, type Y } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return null;
			});
		`;

    const OUTPUT = `
			import { type Y } from 'react';
			const MyInput = function MyInput({ref, ...props}) {
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
			const MyInput = function MyInput({ref, ...props}) {
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
			const MyInput = function MyInput({ref, ...props}) {
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
			const MyInput = ({ref, ...props}: Props & { ref: React.RefObject<HTMLInputElement>; }) => {
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

  it("Typescript: reuses forwardRef typeArguments when type literals are used", () => {
    const INPUT = `
			import { forwardRef } from 'react';
			type Props = { a: 1 };
			
			const MyInput = forwardRef<RefValueType, { a: string }>((props, ref) => {
					return null;
			});
		`;

    const OUTPUT = `
			type Props = { a: 1 };
			const MyInput = ({ref, ...props}: { a: string } & { ref: React.RefObject<RefValueType>; }) => {
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

  it("Typescript: reuses wrapped function type arguments", () => {
    const INPUT = `
			import { forwardRef } from 'react';
			const MyComponent = forwardRef(function Component(
				myProps: Props,
				myRef: React.ForwardedRef<HTMLButtonElement>
			  ) {
				return null;
			  });
		`;

    const OUTPUT = `
			const MyComponent = function Component(
				{ref: myRef, ...myProps}: Props & { ref: React.RefObject<HTMLButtonElement>; }
			) {
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

  it("Typescript: props use type literal", () => {
    const INPUT = `
			import { forwardRef } from 'react';
			const MyComponent = forwardRef(function Component(
				myProps: { a: 1 },
				myRef
			  ) {
				return null;
			  });
		`;

    const OUTPUT = `
			const MyComponent = function Component(
				{ref: myRef, ...myProps}: { a: 1 } & { ref: React.RefObject<unknown>; }
			) {
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
});
