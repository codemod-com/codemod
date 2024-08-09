import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 fpe-computed", () => {
  it("basic", () => {
    const INPUT = `
		import EmberObject from '@ember/object';

        let Person = EmberObject.extend({
        init() {
            this._super(...arguments);

            this.firstName = 'Betty';
            this.lastName = 'Jones';
        },

        fullName: function() {
            return \`\${this.firstName} \${this.lastName}\`;
        }.property('firstName', 'lastName')
        });

        let client = Person.create();

        client.get('fullName'); // 'Betty Jones'

        client.set('lastName', 'Fuller');
        client.get('fullName'); // 'Betty Fuller'
		`;

    const OUTPUT = `
		import { computed } from '@ember/object';
        import EmberObject from '@ember/object';

        let Person = EmberObject.extend({
        init() {
            this._super(...arguments);

            this.firstName = 'Betty';
            this.lastName = 'Jones';
        },

        fullName: computed('firstName', 'lastName', function() {
            return \`\${this.firstName} \${this.lastName}\`;
        })
        });

        let client = Person.create();

        client.get('fullName'); // 'Betty Jones'

        client.set('lastName', 'Fuller');
        client.get('fullName'); // 'Betty Fuller'
        `;

    const fileInfo: FileInfo = {
      path: "index.js",
      source: INPUT,
    };

    const actualOutput = transform(fileInfo, buildApi());

    assert.deepEqual(
      actualOutput?.replace(/\W/gm, ""),
      OUTPUT.replace(/\W/gm, ""),
    );
  });
});
