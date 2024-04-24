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

Changes to the original file: added the options parameter
*/

export default function transform(file, api, options) {
  const j = api.jscodeshift;

  const root = j(file.source);

  const isCompatRouteImportFound = root.find(j.ImportDeclaration, {
    source: { value: "react-router-dom-v5-compat" },
  }).length;

  if (!isCompatRouteImportFound) {
    let computedImport = j.importDeclaration(
      [j.importSpecifier(j.identifier("useNavigate"))],
      j.literal("react-router-dom-v5-compat"),
    );

    let body = root.get().value.program.body;
    body.unshift(computedImport);
  }

  root
    .find(j.ImportDeclaration, {
      source: {
        value: "react-router-dom",
      },
    })
    .forEach((path) => {
      path.value.specifiers
        .filter((s) => s.imported.name === "useHistory")
        .forEach((s) => {
          s.imported.name = "useNavigate";
        });
    });

  root
    .find(j.VariableDeclarator, {
      id: {
        name: "history",
      },
    })
    .replaceWith(() => {
      return j.variableDeclarator(
        j.identifier("navigate"),
        j.callExpression(j.identifier("useNavigate"), []),
      );
    });

  // history.push
  root
    .find(j.CallExpression, {
      callee: {
        object: {
          name: "history",
        },

        property: {
          name: "push",
        },
      },
    })
    .replaceWith((path) => {
      return j.callExpression(j.identifier("navigate"), path.value.arguments);
    });

  // history.replace
  root
    .find(j.CallExpression, {
      callee: {
        object: {
          name: "history",
        },

        property: {
          name: "replace",
        },
      },
    })
    .replaceWith((path) => {
      return j.callExpression(j.identifier("navigate"), [
        ...path.value.arguments,
        j.objectExpression([
          j.objectProperty(
            j.identifier("replace"),
            j.booleanLiteral(true),
            false,
            false,
          ),
        ]),
      ]);
    });

  // history.go
  root
    .find(j.CallExpression, {
      callee: {
        object: {
          name: "history",
        },

        property: {
          name: "go",
        },
      },
    })
    .replaceWith((path) => {
      return j.callExpression(j.identifier("navigate"), path.value.arguments);
    });

  return root.toSource(options);
}
