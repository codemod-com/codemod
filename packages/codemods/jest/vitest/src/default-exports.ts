/*! @license
MIT License

Copyright (c) 2023 Trivikram Kamat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import { dirname, join, resolve } from "node:path";
import type core from "jscodeshift";
import type { Collection } from "jscodeshift";

export const updateDefaultExportMocks = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
	filePath: string,
) => {
	root
		.find(j.CallExpression, {
			callee: {
				type: "MemberExpression",
				object: { type: "Identifier", name: "jest" },
				property: { type: "Identifier" },
			},
		})
		.filter((path) => {
			const { callee } = path.value;
			if (
				!j.MemberExpression.check(callee) ||
				!j.Identifier.check(callee.property)
			) {
				return false;
			}

			return ["mock", "setMock"].includes(callee.property.name);
		})
		.forEach((path) => {
			const { arguments: args } = path.value;

			if (args.length < 2) {
				return;
			}

			const [moduleName, mock] = args;

			if (
				mock.type !== "ArrowFunctionExpression" &&
				mock.type !== "FunctionExpression"
			) {
				return;
			}

			if (
				moduleName.type !== "Literal" &&
				moduleName.type !== "StringLiteral"
			) {
				return;
			}

			const modulePath = resolve(
				join(dirname(filePath), moduleName.value as string),
			);

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const module = require(modulePath);

			if (typeof module === "object") {
				return;
			}

			if (mock.type === "ArrowFunctionExpression") {
				const mockBody = mock.body;
				if (
					mockBody.type === "ObjectExpression" &&
					mockBody.properties
						.map((p) => {
							if (!j.ObjectProperty.check(p) || !j.Identifier.check(p.key)) {
								return;
							}

							return p.key.name;
						})
						.filter(Boolean)
						.includes("default")
				) {
					return;
				}

				if (mockBody.type !== "BlockStatement") {
					mock.body = j.objectExpression([
						j.property("init", j.identifier("default"), mockBody),
					]);
					return;
				}
			}

			if (
				!j.FunctionExpression.check(mock) &&
				!j.ArrowFunctionExpression.check(mock)
			) {
				return;
			}

			const mockBody = mock.body;

			if (!j.BlockStatement.check(mockBody)) {
				return;
			}

			const returnStatement = mockBody.body[mockBody.body.length - 1];
			if (returnStatement.type === "ReturnStatement") {
				const returnArgument = returnStatement.argument;

				if (returnArgument) {
					if (
						returnArgument.type === "ObjectExpression" &&
						returnArgument.properties
							.map((p) => {
								if (!j.ObjectProperty.check(p) || !j.Identifier.check(p.key)) {
									return;
								}

								return p.key.name;
							})
							.filter(Boolean)
							.includes("default")
					) {
						return;
					}

					returnStatement.argument = j.objectExpression([
						j.property("init", j.identifier("default"), returnArgument),
					]);
				}
			}
		});
};
