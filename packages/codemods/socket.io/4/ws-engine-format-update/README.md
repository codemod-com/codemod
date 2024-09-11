

This codemod when bundling the server with webpack will update the format of wsEngine to get the rid following error:

Critical dependency: the request of a dependency is an expression.

## Example
### Before:

```ts
const io = require("socket.io")(httpServer, {
  wsEngine: "eiows"
});
```

### After:

```ts
const io = require("socket.io")(httpServer, {
  wsEngine: require("eiows").Server
});
```