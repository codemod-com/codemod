### Codemod Description:

    Purpose: Refactor renderToReadableStream call expressions to use a combined object argument.
    Changes Made:
      -  Finds Call Expressions: Identifies calls to renderToReadableStream in the code.
      -  Argument Check: Ensures the function calls have exactly three arguments, with the second and third being identifiers.
      -  Create Object Argument: Combines the second and third arguments into a new object argument with properties onError,    context, and a default identifierPrefix.
      -  Replace Arguments: Updates the function call to use the new object argument.

This codemod simplifies the argument structure for renderToReadableStream, aligning it with new conventions or improving readability and maintainability.

### Before

```ts
renderToReadableStream(widget, onErrorCallback, appContextData);
```

### After

```ts
renderToReadableStream(widget, {
  onError: onErrorCallback,
  context: appContextData,
  identifierPrefix: prefix,
});
```
