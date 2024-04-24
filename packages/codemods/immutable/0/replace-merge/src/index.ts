/*! @license

MIT License

Copyright (c) 2020 QuintoAndar.com.br

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

/*
Changes to the original file: added options
*/

import type {
  ASTPath,
  CallExpression,
  JSCodeshift,
  MemberExpression,
  ObjectExpression,
  Transform,
} from "jscodeshift";

class Handler {
  private j: JSCodeshift;
  private path: ASTPath<CallExpression>;
  private argumentsMatch: boolean;

  constructor(j: JSCodeshift, path: ASTPath<CallExpression>) {
    this.j = j;
    this.path = path;
    this.argumentsMatch = this.checkArgumentContract();
  }

  checkArgumentContract() {
    const node = this.path.node;

    if (node.arguments.length !== 1) {
      return false;
    }

    return true;
  }

  transform() {
    if (!this.argumentsMatch) {
      return;
    }

    const baseObject = (this.path.node.callee as MemberExpression).object;
    const argument = this.path.node.arguments[0] as any;
    let newArgument: any[] = [this.j.spreadElement(argument)];

    if (argument.type === "ObjectExpression") {
      const objectArgument = argument as ObjectExpression;

      newArgument = [...objectArgument.properties];
    }

    this.path.replace(
      this.j.objectExpression([
        this.j.spreadElement(baseObject),
        ...newArgument,
      ]),
    );
  }
}

const transform: Transform = (file, api, options) => {
  const j = api.jscodeshift;
  const root = j(file.source);
  const collections = root.find(j.CallExpression, {
    callee: {
      type: "MemberExpression",
      property: {
        type: "Identifier",
        name: "merge",
      },
    },
  });

  collections.forEach((path) => new Handler(j, path).transform());

  return root.toSource(options);
};

export default transform;
