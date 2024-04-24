import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 replace-nested-routes", () => {
  it("should deprecate nested routes and use `render` prop of parent component instead", async () => {
    const input = `
		import React from 'react';
		import { BrowserRouter as Router, Route } from 'react-router-dom';
		
		const App = () => {
		  return (
			<Router>
				<Route path="/parent" component={Parent}>
				  <Route path="/parent/child1" component={Child1} />
				  <Route path="/parent/child2" component={Child2} />
				  <Route path="/parent/child3" component={Child3} />
				</Route>
			</Router>
		  );
		};		
		`;

    const output = `
		import React from 'react';
		import { BrowserRouter as Router, Route } from 'react-router-dom';
		
		const App = () => {
		  return (
			<Router>
				<Route path="/parent" render={(props) => (
				  <Parent {...props}>
					<Route path="/parent/child1" component={Child1} />
					<Route path="/parent/child2" component={Child2} />
					<Route path="/parent/child3" component={Child3} />
				  </Parent>
				)}></Route>
			</Router>
		  );
		};			
		`;
    const fileInfo: FileInfo = {
      path: "index.js",
      source: input,
    };

    const actualOutput = transform(fileInfo, buildApi("js"));

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      output.replace(/\W/gm, ""),
    );
  });
});
