import { API, FileInfo, JSCodeshift } from 'jscodeshift';
import {
  Collection,
  ASTPath,
  CallExpression,
  FunctionExpression,
  ArrowFunctionExpression,
  Identifier,
  MemberExpression,
} from 'jscodeshift/src/core';

export default function transform(
  file: FileInfo,
  api: API,
): string | undefined {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all instances of Sentry.configureScope
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: { name: 'Sentry' },
      property: { name: 'configureScope' },
    },
  }).forEach((path: ASTPath < CallExpression > ) => {
    const callback = path.node.arguments[0];

    // Ensure the argument is a function expression
    if (
      j.FunctionExpression.check(callback) ||
      j.ArrowFunctionExpression.check(callback)
    ) {
      const scopeParam = (
        callback as FunctionExpression | ArrowFunctionExpression
      ).params[0];

      // Ensure the function has a parameter
      if (scopeParam && j.Identifier.check(scopeParam)) {
        const scopeName = (scopeParam as Identifier).name;

        // Collect all method calls on the scope parameter
        const methodCalls: Collection < CallExpression > = [];
        j(callback.body)
          .find(j.CallExpression, {
            callee: {
              type: 'MemberExpression',
              object: { name: scopeName },
            },
          })
          .forEach((callPath: ASTPath < CallExpression > ) => {
            const method = callPath.node.callee
              .property as Identifier;
            const args = callPath.node.arguments;

            // Create new call expression Sentry.getCurrentScope().method(args)
            methodCalls.push(
              j.expressionStatement(
                j.callExpression(
                  j.memberExpression(
                    j.callExpression(
                      j.memberExpression(
                        j.identifier('Sentry'),
                        j.identifier('getCurrentScope'),
                      ),
                      [],
                    ),
                    method,
                  ),
                  args,
                ),
              ),
            );
            dirtyFlag = true;
          });

        // Replace the original Sentry.configureScope call with the new method calls
        if (methodCalls.length > 0) {
          // Insert the new method calls after the current path
          const parent = path.parentPath as ASTPath < any > ;
          methodCalls.forEach((call) => {
            j(parent).insertAfter(call);
          });
          // Remove the original Sentry.configureScope call
          j(path).remove();
        }
      }
    }
  });

  return dirtyFlag ? root.toSource() : undefined;
}