import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react/remove-forward-ref', () => {
	it('Unwraps the render function: callee is member expression', () => {
		let INPUT = `
			import * as React1 from 'react';

			const MyInput = React1.forwardRef((props, ref) => {
					return null;
			});
		`;

		let OUTPUT = `
     import * as React1 from 'react';
     
			const MyInput = ({ ref, ...props }) => {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Unwraps the render function: render function is ArrowFunctionExpression', () => {
		let INPUT = `
			import { forwardRef as forwardRef2 } from 'react';

			const MyInput = forwardRef2((props, ref) => {
					return null;
			});
		`;

		let OUTPUT = `
			const MyInput = ({ ref, ...props }) => {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Unwraps the render function: render function is FunctionExpression', () => {
		let INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function A(props, ref) {
					return null;
			});
		`;

		let OUTPUT = `
			const MyInput = function A({ref, ...props}) {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('forwardRef import: removes the import when only forwardRef is a single specifier', () => {
		let INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return null;
			});
		`;

		let OUTPUT = `
			const MyInput = function MyInput({ref, ...props}) {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('forwardRef import: should not remove type imports', () => {
		let INPUT = `
			import type { X } from "react";
			import { forwardRef, type Y } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return null;
			});
		`;

		let OUTPUT = `
			import type { X } from "react";
			import { type Y } from 'react';
			const MyInput = function MyInput({ref, ...props}) {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('forwardRef import: removes forwardRef specifier', () => {
		let INPUT = `
			import { forwardRef, useState } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return null;
			});
		`;

		let OUTPUT = `
		    import { useState } from 'react';
			const MyInput = function MyInput({ref, ...props}) {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Replaces the second arg of the render function: props are ObjectPattern', () => {
		let INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function MyInput({ onChange }, ref) {
					return <input ref={ref} onChange={onChange} />
			});
		`;

		let OUTPUT = `
			const MyInput = function MyInput({ ref, onChange }) {
				return <input ref={ref} onChange={onChange} />
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Replaces the second arg of the render function: props are Identifier', () => {
		let INPUT = `
			import { forwardRef } from 'react';

			const MyInput = forwardRef(function MyInput(props, ref) {
					return <input ref={ref} onChange={props.onChange} />
			});
		`;

		let OUTPUT = `
			const MyInput = function MyInput({ref, ...props}) {
				return <input ref={ref} onChange={props.onChange} />
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Typescript: reuses forwardRef typeArguments', () => {
		let INPUT = `
			import { forwardRef } from 'react';
			type Props = { a: 1 };
			
			const MyInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
					return null;
			});
		`;

		let OUTPUT = `
			type Props = { a: 1 };
			const MyInput = ({ref, ...props}: Props & { ref: React.RefObject<HTMLInputElement>; }) => {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));
		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Typescript: reuses forwardRef typeArguments when type literals are used', () => {
		let INPUT = `
			import { forwardRef } from 'react';
			type Props = { a: 1 };
			
			const MyInput = forwardRef<RefValueType, { a: string }>((props, ref) => {
					return null;
			});
		`;

		let OUTPUT = `
			type Props = { a: 1 };
			const MyInput = ({ref, ...props}: { a: string } & { ref: React.RefObject<RefValueType>; }) => {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));
		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Typescript: reuses wrapped function type arguments', () => {
		let INPUT = `
			import { forwardRef } from 'react';
			const MyComponent = forwardRef(function Component(
				myProps: Props,
				myRef: React.ForwardedRef<HTMLButtonElement>
			  ) {
				return null;
			  });
		`;

		let OUTPUT = `
			const MyComponent = function Component(
				{ref: myRef, ...myProps}: Props & { ref: React.RefObject<HTMLButtonElement>; }
			) {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));
		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('Typescript: props use type literal', () => {
		let INPUT = `
			import { forwardRef } from 'react';
			const MyComponent = forwardRef(function Component(
				myProps: { a: 1 },
				myRef
			  ) {
				return null;
			  });
		`;

		let OUTPUT = `
			const MyComponent = function Component(
				{ref: myRef, ...myProps}: { a: 1 } & { ref: React.RefObject<unknown>; }
			) {
				return null;
			};
		`;

		let fileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));
		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});
});
