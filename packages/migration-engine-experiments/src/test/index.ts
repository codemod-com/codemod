import { describe, expect, it } from "vitest";

import { js } from "../index.js";

const trimText = (text: string) => text.replace(/\s/gm, "");

const sampleCode = js /* ts */`
const someFn = () => {
    const a = 1;
    const b = 2;
    return a * b;
}
const var = 1;
console.log(var);
`;

describe("js", () => {
	/**
	 * Chain operations like jQuery
	 */
	it("replaces console.log with console.error using chain", () => {
		const modifiedCode = sampleCode.astGrep /* ts */`console.log($A)`
			.replaceWith /* ts */`console.error($A)`;

		expect(trimText(modifiedCode)).toEqual(
			trimText(/* ts */ `
                     const someFn = () => {
                         const a = 1;
                         const b = 2;
                         return a * b;
                     }
                     const var = 1;
                     console.error(var);
            `),
		);
	});

	/**
	 * Callback is needed when we want multiple operations to be done
	 * For example:
	 * sampleCode(({ astGrep, jsCodeShift }) => {
	 *   astGrep ...
	 *   jsCodeShift ...
	 * })
	 */
	it("replaces console.log with console.error using callback", () => {
		sampleCode(({ astGrep }) => {
			const modifiedCode = astGrep /* ts */`console.log($A)`
				.replaceWith /* ts */`console.error($A)`;

			expect(trimText(modifiedCode)).toEqual(
				trimText(/* ts */ `
                     const someFn = () => {
                         const a = 1;
                         const b = 2;
                         return a * b;
                     }
                     const var = 1;
                     console.error(var);
            `),
			);
		});
	});

	it("replaces someFn with replacedFn using callback using spread match", () => {
		const modifiedCode = sampleCode.astGrep /* ts */`const someFn = () => { $$$LOGIC }`
			.replaceWith /* ts */`const replacedFn = () => { $$$LOGIC }`;

		expect(trimText(modifiedCode)).toEqual(
			trimText(/* ts */ `
                const replacedFn = () => {
                    const a = 1;
                    const b = 2;
                    return a * b;
                }
                const var = 1;
                console.log(var);
            `),
		);
	});
});
