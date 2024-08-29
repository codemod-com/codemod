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
export default function (fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all instances of useRef with a type argument of TouchableHighlight
  root.find(j.CallExpression, {
      callee: {
          type: 'Identifier',
          name: 'useRef',
      },
  }).forEach((path) => {
      // Check if typeArguments exist and is exactly TouchableHighlight
      const typeArguments = path.value.typeParameters;
      if (
          typeArguments &&
          typeArguments.params &&
          typeArguments.params.length > 0 &&
          typeArguments.params[0].typeName &&
          typeArguments.params[0].typeName.name === 'TouchableHighlight'
      ) {
          // Replace TouchableHighlight with View
          typeArguments.params[0].typeName.name = 'View';
      }
  });

  return root.toSource();
}