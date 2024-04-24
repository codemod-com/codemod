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

  root
    .find(j.JSXElement, {
      openingElement: { name: { name: "Router" } },
    })
    .forEach((path) => {
      const hasSwitch = root.findJSXElements("Switch").length > 0;

      if (hasSwitch) {
        return;
      }

      const children = path.value.children;
      const newEl = j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier("Switch"), [], false),
        j.jsxClosingElement(j.jsxIdentifier("Switch")),
        children,
      );

      path.value.children = [j.jsxText("\n  "), newEl, j.jsxText("\n")];
      dirtyFlag = true;
    });

  if (!dirtyFlag) {
    return undefined;
  }

  return root.toSource(options);
}

transform satisfies Transform;

export default transform;
