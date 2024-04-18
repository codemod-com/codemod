This codemod renames `disableBuildhook` to `disableBuildEventHandlers` as required in Netlify SDK v0.8.1.

## Before

```jsx
await client.disableBuildhook(siteId);
```

## After

```jsx
await client.disableBuildEventHandlers(siteId);
```
