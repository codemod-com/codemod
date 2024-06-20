import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react/19/use-context-hook: useContext -> use', () => {
	describe('javascript code', () => {
		it('should replace useContext with use', async () => {
			let input = `
    	import { useContext } from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = useContext(ThemeContext);
		`;

			let output = `
    	import { use } from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = use(ThemeContext);
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should replace React.useContext with use', async () => {
			let input = `
    	import React from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = React.useContext(ThemeContext);
		`;

			let output = `
    	import React from "react";
    	import ThemeContext from "./ThemeContext";

		const theme = React.use(ThemeContext);
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should not replace any.useContext() with use', async () => {
			let input = `
		const theme = trpc.useContext();
		`;

			let output = `
		const theme = trpc.useContext();
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('js'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});
	});

	describe('typescript code', () => {
		it('should replace useContext with use', async () => {
			let input = `
    	import { useContext } from "react";
    	import ThemeContext from "./ThemeContext";

		function Component({
			appUrl,
		  }: {
			appUrl: string;
		  }) {
			const theme = useContext(ThemeContext);
			return <div />;
		};
		`;

			let output = `
    	import { use } from "react";
    	import ThemeContext from "./ThemeContext";

		function Component({
			appUrl,
		  }: {
			appUrl: string;
		  }) {
			const theme = use(ThemeContext);
			return <div />;
		};
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should replace React.useContext with use', async () => {
			let input = `
			import React from "react";
			import ThemeContext from "./ThemeContext";
	
			function Component({
				appUrl,
			  }: {
				appUrl: string;
			  }) {
				const theme = React.useContext(ThemeContext);
				return <div />;
			};
			`;

			let output = `
    	import React from "react";
    	import ThemeContext from "./ThemeContext";

		function Component({
			appUrl,
		  }: {
			appUrl: string;
		  }) {
			const theme = React.use(ThemeContext);
			return <div />;
		};
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should not replace any.useContext() with use', async () => {
			let input = `
			function Component({
				appUrl,
			  }: {
				appUrl: string;
			  }) {
				const theme = trpc.useContext();
				return <div />;
			};
		`;

			let output = `
			function Component({
				appUrl,
			  }: {
				appUrl: string;
			  }) {
				const theme = trpc.useContext();
				return <div />;
			};
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'), {
				quote: 'single',
			});

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});
	});
});
