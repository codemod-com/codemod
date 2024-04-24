import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 add-exact-prop", () => {
  it("should add exact prop", async () => {
    const input = `
		import { Route, Router, Switch } from 'react-router-dom';

		const MyApp = () => (
			<Router history={history}>
				<Switch>
					<Route path="/posts" component={PostList} />
					<Route path="/posts/:id" component={PostEdit} />
					<Route path="/posts/:id/show" component={PostShow} />
					<Route path="/posts/:id/delete" component={PostDelete} />
				</Switch>
			</Router>
		);
		`;

    const output = `
		import { Route, Router, Switch } from 'react-router-dom';

		const MyApp = () => (
			<Router history={history}>
				<Switch>
					<Route exact path="/posts" component={PostList} />
					<Route exact path="/posts/:id" component={PostEdit} />
					<Route exact path="/posts/:id/show" component={PostShow} />
					<Route exact path="/posts/:id/delete" component={PostDelete} />
				</Switch>
			</Router>
		);
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
