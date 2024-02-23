import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 cp-property-map", () => {
	it("basic", () => {
		const INPUT = `
		const Person = EmberObject.extend({
            friendNames: map('friends', function(friend) {
              return friend[this.get('nameKey')];
            }).property('nameKey')
          });
		`;

		const OUTPUT = `
		const Person = EmberObject.extend({
            friendNames: map('friends', ['nameKey'], function(friend) {
              return friend[this.get('nameKey')];
            })
          });
        `;

		const fileInfo: FileInfo = {
			path: "index.js",
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi("js"));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ""),
			OUTPUT.replace(/\W/gm, ""),
		);
	});
});
