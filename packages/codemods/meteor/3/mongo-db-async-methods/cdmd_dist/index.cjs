/*! @license
The MIT License (MIT)

Copyright (c) 2024 mohab-sameh

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => transform,
});
function transform(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;
  const methods = ["find", "findOne", "insert", "upsert", "update", "remove"];
  root.find(j.CallExpression).forEach((path) => {
    const { node } = path;
    if (
      j.MemberExpression.check(node.callee) &&
      j.Identifier.check(node.callee.property) &&
      node.callee.property.name === "fetch"
    ) {
      const innerCall = node.callee.object;
      if (
        j.CallExpression.check(innerCall) &&
        j.MemberExpression.check(innerCall.callee) &&
        j.Identifier.check(innerCall.callee.property) &&
        methods.includes(innerCall.callee.property.name)
      ) {
        const methodName = innerCall.callee.property.name;
        const asyncMethodName = `${methodName}Async`;
        innerCall.callee.property.name = asyncMethodName;
        path.replace(j.awaitExpression(innerCall));
        dirtyFlag = true;
      }
    }
  });
  return dirtyFlag ? root.toSource() : undefined;
}
