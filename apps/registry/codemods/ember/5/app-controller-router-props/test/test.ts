import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 app-controller-router-props", function () {
	it("basic", function () {
		const INPUT = `
		import Controller from '@ember/controller';
        import fetch from 'fetch';

        export default Controller.extend({
        store: service('store'),

        actions: {
            sendPayload() {
            fetch('/endpoint', {
                method: 'POST',
                body: JSON.stringify({
                route: this.currentRouteName
                })
            });
            }
        }
        })
		`;

		const OUTPUT = `
		import Controller from '@ember/controller';
        import fetch from 'fetch';

        export default Controller.extend({
        router: service("router"),
        store: service('store'),

        actions: {
            sendPayload() {
            fetch('/endpoint', {
                method: 'POST',
                body: JSON.stringify({
                route: this.router.currentRouteName
                })
            });
            }
        }
        })
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
