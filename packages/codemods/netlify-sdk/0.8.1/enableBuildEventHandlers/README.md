This codemod renames `enableBuildhook` to `enableBuildEventHandlers` as required in Netlify SDK v0.8.1.

## Before

```jsx
await client.enableBuildhook(siteId);
```

## After

```jsx
await client.enableBuildEventHandlers(siteId);
```
