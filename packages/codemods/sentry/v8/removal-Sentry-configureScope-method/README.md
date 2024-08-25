This codemod facilitates the migration from Sentry version 7.x to 8.x by removing the deprecated Sentry.configureScope method. Instead, it transforms the code to utilize Sentry.getCurrentScope() for accessing and mutating the current scope. This change simplifies the API and aligns with the latest Sentry practices.

## Example

### Before

```ts
Sentry.configureScope((scope) => {
  scope.setTag('key', 'value');
});
```

### After

```ts
Sentry.getCurrentScope().setTag('key', 'value');
```
,
### Before

```ts
Sentry.configureScope((scope) => {
  scope.setTag('user', '123');
});
```

### After

```ts
Sentry.getCurrentScope().setTag('user', '123');
```
,
### Before

```ts
Sentry.configureScope((scope) => {
  scope.setUser({ id: '456', email: 'user@example.com' });
});
```

### After

```ts
Sentry.getCurrentScope().setUser({ id: '456', email: 'user@example.com' });
```
,
### Before

```ts
Sentry.configureScope((scope) => {
  scope.setExtra('key', 'value');
});
```

### After

```ts
Sentry.getCurrentScope().setExtra('key', 'value');
```
,
### Before

```ts
Sentry.configureScope((scope) => {
  scope.setTag('level', 'info');
  scope.setTag('action', 'click');
});
```

### After

```ts
Sentry.getCurrentScope().setTag('action', 'click');
Sentry.getCurrentScope().setTag('level', 'info');
```

