import assert from "node:assert/strict";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("Remove memoization hooks", () => {
	it("should remove useCallback", () => {
		const input = `
		import { useCallback } from 'react';

		function Component() {
			const callback = useCallback();
		}
		`;

		const output = `
		function Component() {
			const callback = ();
		}
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

	it("should remove useMemo", () => {
		const input = `
		import { useMemo } from 'react';

		function Component() {
			const callback = useMemo();
		}
		`;

		const output = `
		function Component() {
			const callback = ();
		}
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

	it("should remove memo", () => {
		const input = `
		import { memo } from 'react';

		function Component() {
			const callback = memo();
		}
		`;

		const output = `
		function Component() {
			const callback = ();
		}
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

	it("should remove all three", () => {
		const input = `
		import { memo, useMemo, useCallback, useState } from 'react';

		function Component() {
			const callback1 = useMemo();
			const callback2 = useCallback();
			const callback3 = memo();
		}
		`;

		const output = `
		import { useState } from 'react';

		function Component() {
			const callback1 = ();
			const callback2 = ();
			const callback3 = ();
		}
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

	it("should remove React.useMemo, React.useCallback, React.memo", () => {
		const input = `
		import React from 'react';

		function Component() {
			const state = React.useState();
			const callback1 = React.useMemo();
			const callback2 = React.useCallback();
			const callback3 = React.memo();
		}
		`;

		const output = `
		import React from 'react';

		function Component() {
			const state = React.useState();
			const callback1 = ();
			const callback2 = ();
			const callback3 = ();
		}
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
