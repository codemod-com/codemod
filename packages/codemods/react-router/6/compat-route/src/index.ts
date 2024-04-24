/*! @license

The MIT License (MIT)

Copyright (c) 2023 Rajasegar Chandran

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

import type { API, FileInfo, Options, Transform } from "jscodeshift";

function transform(
  file: FileInfo,
  api: API,
  options: Options,
): string | undefined {
  const j = api.jscodeshift;

  const root = j(file.source);

  let dirtyFlag = false;

  const isCompatRouteImportFound = root.find(j.ImportDeclaration, {
    source: { value: "react-router-dom-v5-compat" },
  }).length;

  if (!isCompatRouteImportFound) {
    const computedImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("CompatRoute"))],
      j.literal("react-router-dom-v5-compat"),
    );

    const body = root.get().value.program.body;
    body.unshift(computedImport);

    dirtyFlag = true;
  }

  root
    .find(j.JSXElement, {
      openingElement: { name: { name: "Route" } },
    })
    .forEach((path) => {
      if ("name" in path.value.openingElement.name) {
        path.value.openingElement.name.name = "CompatRoute";

        dirtyFlag = true;
      }
    });

  if (!dirtyFlag) {
    return undefined;
  }

  return root.toSource(options);
}

transform satisfies Transform;

export default transform;
