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

import type { API, FileInfo } from "jscodeshift";
import { updateDefaultExportMocks } from "./default-exports.js";
import { addFactoryFunctionToMock } from "./factory-func.js";
import {
  getApisFromCallExpression,
  getApisFromMemberExpression,
} from "./get-api-calls.js";
import { addImport } from "./import.js";
import { replaceJestObjectWithVi } from "./jest-vi.js";
import { replaceTestApiFailing, replaceTestApiFit } from "./replace-api.js";

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  if (file.path.endsWith(".snap")) {
    return file.source.replace("Array [", "[").replace("Object {", "{");
  }

  const j = api.jscodeshift;
  const root = j(file.source);

  const apisFromCallExpression = getApisFromCallExpression(root, j);
  const apisFromMemberExpression = getApisFromMemberExpression(root, j);
  const vitestApis = [
    ...new Set([...apisFromCallExpression, ...apisFromMemberExpression]),
  ];

  if (vitestApis.length) {
    vitestApis.sort();
    const importSpecifiers = vitestApis.map((apiName) =>
      j.importSpecifier(j.identifier(apiName)),
    );
    const importDeclaration = j.importDeclaration(
      importSpecifiers,
      j.stringLiteral("vitest"),
    );
    addImport(root, j, importDeclaration);
  }

  replaceTestApiFit(root, j);
  replaceTestApiFailing(root, j);

  addFactoryFunctionToMock(root, j);
  updateDefaultExportMocks(root, j, file.path);
  replaceJestObjectWithVi(root, j);

  root
    .find(j.ImportDeclaration, {
      source: { value: "@jest/globals" },
    })
    .remove();

  return root.toSource();
}
