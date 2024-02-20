import assert from "node:assert";
import { buildApi } from "@codemod-com/utilities";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 fpe-on", function () {
	it("basic", function () {
		const INPUT = `
		import EmberObject from '@ember/object';
        import { sendEvent } from '@ember/object/events';

        let Job = EmberObject.extend({
        logCompleted: function() {
            console.log('Job completed!');
        }.on('completed')
        });

        let job = Job.create();

        sendEvent(job, 'completed'); // Logs 'Job completed!'
		`;

		const OUTPUT = `
		import { on } from '@ember/object/evented';
        import EmberObject from '@ember/object';
        import { sendEvent } from '@ember/object/events';

        let Job = EmberObject.extend({
        logCompleted: on('completed', function() {
            console.log('Job completed!');
        })
        });

        let job = Job.create();

        sendEvent(job, 'completed'); // Logs 'Job completed!'
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
