import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router 4 replace-location-query", () => {
	it("one instance", () => {
		const INPUT = `
			const id = location.query.id;
        `;

		const OUTPUT = `
			import { parse } from 'query-string';
			const id = parse(location.search).id;
        `;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});

	it("multiple instances", () => {
		const INPUT = `
			const id = location.query.id;
			const name = location.query.name;
        `;

		const OUTPUT = `
			import { parse } from 'query-string';
			const id = parse(location.search).id;
			const name = parse(location.search).name;
        `;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});

	it("one instance in a functional component", () => {
		const INPUT = `
			const List = ({ location }) => (
				<div>
					<h1>{location.query.sort}</h1>
				</div>
			);
        `;

		const OUTPUT = `
			import { parse } from 'query-string';
			const List = ({ location }) => (
				<div>
					<h1>{parse(location.search).sort}</h1>
				</div>
			);
        `;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});

	it("multiple instances in a functional component", () => {
		const INPUT = `
			const List = ({ location }) => (
				<div>
					<h1>{location.query.sort}</h1>
					<h1>{location.query.name}</h1>
					<h1>{location.query.id}</h1>
				</div>
			);
        `;

		const OUTPUT = `
			import { parse } from 'query-string';
			const List = ({ location }) => (
				<div>
					<h1>{parse(location.search).sort}</h1>
					<h1>{parse(location.search).name}</h1>
					<h1>{parse(location.search).id}</h1>
				</div>
			);
        `;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});

	it("query-string import statement should not be added when location.query is not used", () => {
		const INPUT = `
			const x = location;
        `;

		const OUTPUT = `
			const x = location;
        `;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("tsx"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});

	describe("examples from netlify-react-ui", () => {
		it("example 1", () => {
			const INPUT = `
			function getOptions(props) {
				return { ...props.location.query };
			}
        `;

			const OUTPUT = `
			import { parse } from 'query-string';

			function getOptions(props) {
				return { ...parse(props.location.search) };
			}
        `;

			const fileInfo: FileInfo = {
				path: "index.js",
				source: INPUT,
			};

			const actualOutput = transform(fileInfo, buildApi("tsx"));

			actualOutput?.replace(/\W/gm, ""), OUTPUT.replace(/\W/gm, "");
		});

		it("example 2", () => {
			const INPUT = `
			function mapStateToProps(state: State, ownProps) {
				const { site, plan } = ownProps.location.query;

				return {
					siteId: site,
					highlightPlan: plan,
				};
			}
			`;

			const OUTPUT = `
			import { parse } from 'query-string';
			
			function mapStateToProps(state: State, ownProps) {
				const { site, plan } = parse(ownProps.location.search);

				return {
					siteId: site,
					highlightPlan: plan,
				};
			}
			`;

			const fileInfo: FileInfo = {
				path: "index.js",
				source: INPUT,
			};

			const actualOutput = transform(fileInfo, buildApi("tsx"));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ""),
				OUTPUT.replace(/\W/gm, ""),
			);
		});

		it("example 3", () => {
			const INPUT = `
			const SiteAuditLog = (props) => {
				const { page } = props.location.query;
			  
				return <ConnectedSiteAuditLog page={page} {...props} />;
			};
			`;

			const OUTPUT = `
			import { parse } from 'query-string';

			const SiteAuditLog = (props) => {
				const { page } = parse(props.location.search);
			  
				return <ConnectedSiteAuditLog page={page} {...props} />;
			};
			`;

			const fileInfo: FileInfo = {
				path: "index.js",
				source: INPUT,
			};

			const actualOutput = transform(fileInfo, buildApi("tsx"));

			assert.deepEqual(
				actualOutput?.replace(/\W/gm, ""),
				OUTPUT.replace(/\W/gm, ""),
			);
		});
	});
});
