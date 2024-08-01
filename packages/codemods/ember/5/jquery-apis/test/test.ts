import assert from "node:assert";
import { buildApi } from "@codemod-com/codemod-utils";
import type { FileInfo } from "jscodeshift";
import { describe, it } from "vitest";
import transform from "../src/index.js";

describe("ember 5 jquery-apis", () => {
  it("Events", () => {
    const INPUT = `
		import Component from '@ember/component';

        export default Component.extend({
        waitForAnimation() {
            this.$().on('transitionend', () => this.doSomething());
        }
        });
        `;

    const OUTPUT = `
        import Component from '@ember/component';

        export default Component.extend({
        waitForAnimation() {
            this.element.addEventListener('transitionend', () => this.doSomething());
        }
        });
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

  it("Query Selector", () => {
    const INPUT = `
		import Component from '@ember/component';

        export default Component.extend({
        waitForAnimation() {
            this.$('.animated').on('transitionend', () => this.doSomething());
        }
        });
        `;

    const OUTPUT = `
        import Component from '@ember/component';

        export default Component.extend({
        waitForAnimation() {
            this.element.querySelectorAll('.animated').forEach(el => el.addEventListener('transitionend', () => this.doSomething()));
        }
        });
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
