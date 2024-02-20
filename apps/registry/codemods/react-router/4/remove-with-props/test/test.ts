import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 remove-with-props", function () {
	it("Should replace withProps HOC", async function () {
		const input = `
		import withProps from 'recompose/withProps';
		import Dashboard from './Dashboard';

		const MyApp = ({ title }) => {
			const DashboardWithTitle = withProps(Dashboard, { title });
			return (
				<Router history={history}>
					<Route path="/" component={DashboardWithTitle} />
				</Router>
			);
		};
		`;

		const output = `
		import withProps from 'recompose/withProps';
		import Dashboard from './Dashboard';

		const MyApp = ({ title }) => {
			return (
				<Router history={history}>
					<Route
						path="/"
						render={(props) => {
							return <Dashboard title={title} {...props} />;
						}}
					/>
				</Router>
			);
		};
		`;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi("js"), {
			quote: "single",
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			output.replace(/\W/gm, ""),
		);
	});
});
