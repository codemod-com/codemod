import assert from "node:assert/strict";
import { buildApi, trimLicense } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("react-router v4 replace-nested-routes", () => {
	it("1", async () => {
		const input = `
		import React from 'react';
		import { Route } from 'react-router-dom';
		
		const App = () => {
		  return (
			<div>
			  <Route path="/home" component={Home}>
				<Route path="/about" component={About} />
				<Route path="/contact" component={Contact} />
			  </Route>
			</div>
		  );
		};
		`;

		const output = `
		import React from 'react';
		import { Route } from 'react-router-dom';
		
		const App = () => {
		  return (
			<div>
			  <Route path="/home" render={() => (
				<Route path="/about" component={About} />
				<Route path="/contact" component={Contact} />
			  )}/>
			</div>
		  );
		};		
		`;
		const fileInfo: FileInfo = {
			path: "index.js",
			source: trimLicense(input),
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			trimLicense(output).replace(/\W/gm, ""),
		);
	});

	it("2", async () => {
		const input = `
		import React from 'react';
		import { Route, Switch } from 'react-router-dom';
		
		const App = () => {
		  return (
			<div>
			  <Switch>
				<Route path="/home" component={Home} />
				<Route path="/about" component={About}>
				  <Route path="/team" component={Team} />
				</Route>
			  </Switch>
			</div>
		  );
		};
		`;

		const output = `
		import React from 'react';
		import { Route, Switch } from 'react-router-dom';
		
		const App = () => {
		  return (
			<div>
			  <Switch>
				<Route path="/home" component={Home} />
				<Route path="/about" render={() => (
				  <Route path="/team" component={Team} />
				)} />
			  </Switch>
			</div>
		  );
		};			
		`;
		const fileInfo: FileInfo = {
			path: "index.js",
			source: trimLicense(input),
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			trimLicense(output).replace(/\W/gm, ""),
		);
	});

	it("3", async () => {
		const input = `
		import React from 'react';
		import { Route, BrowserRouter as Router } from 'react-router-dom';
		
		const App = () => {
		  return (
			<Router>
			  <div>
				<Route path="/home" component={Home}>
				  <Route path="/about" component={About} />
				  <Route path="/contact" component={Contact} />
				</Route>
			  </div>
			</Router>
		  );
		};		
		`;

		const output = `
		import React from 'react';
		import { Route, BrowserRouter as Router } from 'react-router-dom';
		
		const App = () => {
		  return (
			<Router>
			  <div>
				<Route path="/home" render={() => (
				  <Route path="/about" component={About} />
				  <Route path="/contact" component={Contact} />
				)} />
			  </div>
			</Router>
		  );
		};					
		`;
		const fileInfo: FileInfo = {
			path: "index.js",
			source: trimLicense(input),
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			trimLicense(output).replace(/\W/gm, ""),
		);
	});
});
