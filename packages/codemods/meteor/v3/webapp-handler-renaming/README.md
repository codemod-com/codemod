

This codemod automates the process of updating API names from Connect to Express in your project. The codemod is specifically designed to align your codebase with the new naming conventions introduced after switching from Connect to Express in Meteor 3.0.

You can find the implementation of this codemod in the Studio [here](https://go.codemod.com/CiUQu35).

## Overview

This codemod updates the following API names:
- `WebApp.connectHandlers.use(middleware)` is now `WebApp.handlers.use(middleware)`.
- `WebApp.rawConnectHandlers.use(middleware)` is now `WebApp.rawHandlers.use(middleware)`.
- `WebApp.connectApp` is now `WebApp.expressApp`.

## Examples

### Example 1: Updating Middleware Handlers

This codemod updates the API names for middleware handlers.

#### Before

```ts
WebApp.connectHandlers.use(middleware);
WebApp.rawConnectHandlers.use(middleware);
```

#### After

```ts
WebApp.handlers.use(middleware);
WebApp.rawHandlers.use(middleware);
```

### Example 2: Updating WebApp Instance

This codemod updates the `WebApp.connectApp` to the new `WebApp.expressApp`.

#### Before

```ts
const app = WebApp.connectApp;
```

#### After

```ts
const app = WebApp.expressApp;
```
