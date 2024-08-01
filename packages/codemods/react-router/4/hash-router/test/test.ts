import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/codemod-utils";
import { trimLicense } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 hash-router", () => {
  it("should replace Router component with HashRouter, add HashRouter import", async () => {
    const input = `
		import { Router, hashHistory } from 'react-router';
		const MyApp = () => (
		<Router history={hashHistory}>
			<Route path="/posts" component={PostList} />
			<Route path="/posts/:id" component={PostEdit} />
			<Route path="/posts/:id/show" component={PostShow} />
			<Route path="/posts/:id/delete" component={PostDelete} />
		</Router>
		);
		`;

    const output = `
		import { HashRouter } from 'react-router-dom';
		import { Router, hashHistory } from 'react-router';
		const MyApp = () => (
		<HashRouter>
			<Route path="/posts" component={PostList} />
			<Route path="/posts/:id" component={PostEdit} />
			<Route path="/posts/:id/show" component={PostShow} />
			<Route path="/posts/:id/delete" component={PostDelete} />
		</HashRouter>
		);
		`;
    const fileInfo: FileInfo = {
      path: "index.js",
      source: trimLicense(input),
    };

    const actualOutput = transform(fileInfo, buildApi(), {
      quote: "single",
    });

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      trimLicense(output).replace(/\W/gm, ""),
    );
  });
});
