import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('Context.Provider -> Context', () => {
	describe('javascript code', () => {
		it('should replace ThemeContext.Provider with ThemeContext', async () => {
			let input = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <ThemeContext.Provider value={theme}>
				<Page />
			  </ThemeContext.Provider>
			);
		  }
		`;

			let output = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <ThemeContext value={theme}>
				<Page />
			  </ThemeContext>
			);
		  }
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('js'));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should replace Context.Provider with Context', async () => {
			let input = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <Context.Provider value={theme}>
				<Page />
			  </Context.Provider>
			);
		  }
		`;

			let output = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <Context value={theme}>
				<Page />
			  </Context>
			);
		  }
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('js'));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should do nothing if .Provider does not exist', async () => {
			let input = `
		function App() {
			const [theme, setTheme] = useState('light');

			return (
			  <Context value={theme}>
				<Page />
			  </Context>
			);
		  }
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('js'));

			assert.deepEqual(actualOutput, undefined);
		});
	});

	describe('typescript code', () => {
		it('should replace ThemeContext.Provider with ThemeContext', async () => {
			let input = `
		function App({ url }: { url: string }) {
			const [theme, setTheme] = useState<'light' | 'dark'>('light');

			return (
			  <ThemeContext.Provider value={theme}>
				<Page />
			  </ThemeContext.Provider>
			);
		  }
		`;

			let output = `
		function App({ url }: { url: string }) {
			const [theme, setTheme] = useState<'light' | 'dark'>('light');

			return (
			  <ThemeContext value={theme}>
				<Page />
			  </ThemeContext>
			);
		  }
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should replace Context.Provider with Context', async () => {
			let input = `
		function App({ url }: { url: string }) {
			const [theme, setTheme] = useState<'light' | 'dark'>('light');

			return (
			  <Context.Provider value={theme}>
				<Page />
			  </Context.Provider>
			);
		  }
		`;

			let output = `
		function App({ url }: { url: string }) {
			const [theme, setTheme] = useState<'light' | 'dark'>('light');

			return (
			  <Context value={theme}>
				<Page />
			  </Context>
			);
		  }
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				output.replace(/\W/gm, ''),
			);
		});

		it('should do nothing if .Provider does not exist', async () => {
			let input = `
		function App({ url }: { url: string }) {
			const [theme, setTheme] = useState<'light' | 'dark'>('light');

			return (
			  <Context value={theme}>
				<Page />
			  </Context>
			);
		  }
		`;

			let fileInfo: FileInfo = {
				path: 'index.ts',
				source: input,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'));

			assert.deepEqual(actualOutput, undefined);
		});
	});
});
