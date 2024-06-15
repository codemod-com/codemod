import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router 4 replace-location-query', () => {
	it('one instance', () => {
		let INPUT = `
			const id = location.query.id;
        `;

		let OUTPUT = `
			import { parse } from 'query-string';
			const id = parse(location.search).id;
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('multiple instances', () => {
		let INPUT = `
			const id = location.query.id;
			const name = location.query.name;
        `;

		let OUTPUT = `
			import { parse } from 'query-string';
			const id = parse(location.search).id;
			const name = parse(location.search).name;
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('one instance in a functional component', () => {
		let INPUT = `
			const List = ({ location }) => (
				<div>
					<h1>{location.query.sort}</h1>
				</div>
			);
        `;

		let OUTPUT = `
			import { parse } from 'query-string';
			const List = ({ location }) => (
				<div>
					<h1>{parse(location.search).sort}</h1>
				</div>
			);
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('multiple instances in a functional component', () => {
		let INPUT = `
			const List = ({ location }) => (
				<div>
					<h1>{location.query.sort}</h1>
					<h1>{location.query.name}</h1>
					<h1>{location.query.id}</h1>
				</div>
			);
        `;

		let OUTPUT = `
			import { parse } from 'query-string';
			const List = ({ location }) => (
				<div>
					<h1>{parse(location.search).sort}</h1>
					<h1>{parse(location.search).name}</h1>
					<h1>{parse(location.search).id}</h1>
				</div>
			);
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('query-string import statement should not be added when location.query is not used', () => {
		let INPUT = `
			const x = location;
        `;

		let OUTPUT = `
			const x = location;
        `;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	describe('examples from netlify-react-ui', () => {
		it('example 1', () => {
			let INPUT = `
			function getOptions(props) {
				return { ...props.location.query };
			}
        `;

			let OUTPUT = `
			import { parse } from 'query-string';

			function getOptions(props) {
				return { ...parse(props.location.search) };
			}
        `;

			let fileInfo: FileInfo = {
				path: 'index.js',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'));

			actualOutput?.replace(/\W/gm, ''), OUTPUT.replace(/\W/gm, '');
		});

		it('example 2', () => {
			let INPUT = `
			function mapStateToProps(state: State, ownProps) {
				const { site, plan } = ownProps.location.query;

				return {
					siteId: site,
					highlightPlan: plan,
				};
			}
			`;

			let OUTPUT = `
			import { parse } from 'query-string';
			
			function mapStateToProps(state: State, ownProps) {
				const { site, plan } = parse(ownProps.location.search);

				return {
					siteId: site,
					highlightPlan: plan,
				};
			}
			`;

			let fileInfo: FileInfo = {
				path: 'index.js',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});

		it('example 3', () => {
			let INPUT = `
			const SiteAuditLog = (props) => {
				const { page } = props.location.query;
			  
				return <ConnectedSiteAuditLog page={page} {...props} />;
			};
			`;

			let OUTPUT = `
			import { parse } from 'query-string';

			const SiteAuditLog = (props) => {
				const { page } = parse(props.location.search);
			  
				return <ConnectedSiteAuditLog page={page} {...props} />;
			};
			`;

			let fileInfo: FileInfo = {
				path: 'index.js',
				source: INPUT,
			};

			let actualOutput = transform(fileInfo, buildApi('tsx'));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ''),
				OUTPUT.replace(/\W/gm, ''),
			);
		});
	});
});
