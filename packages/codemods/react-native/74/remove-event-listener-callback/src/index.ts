/*! @license
The MIT License (MIT)

Copyright (c) 2023 Codemod.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
Changes to the original file: added TypeScript, dirty flag, nullability checks
*/

import type { API, FileInfo, Options } from "jscodeshift";
export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  const declarationsToRemove = [] as string[];

  root
    .find(j.CallExpression, {
      callee: {
        object: {
          name: "PushNotificationIOS",
        },
        property: {
          name: "removeEventListener",
        },
      },
    })
    .forEach((path) => {
      // Check if the second argument is a function
      if (path.node.arguments[1]) {
        if (j.Identifier.check(path.node.arguments[1])) {
          declarationsToRemove.push(path.node.arguments[1]?.name);
        }
        // Remove the second argument
        path.node.arguments.pop();
      }
    });

  // Remove declarations if they are not used anywhere else
  declarationsToRemove
    .filter((variable) => {
      const isUsed = !!root
        .find(j.Identifier, { name: variable })
        .filter((path) => {
          return (
            !j.VariableDeclarator.check(path.parent?.value) ||
            path.parent?.value.id.name !== variable
          );
        }).length;

      return !isUsed;
    })
    .forEach((variable) => {
      root.find(j.VariableDeclarator, { id: { name: variable } }).remove();
    });

  return root.toSource();
}
