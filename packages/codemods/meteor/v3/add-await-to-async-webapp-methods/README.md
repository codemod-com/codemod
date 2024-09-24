Below are some webapp methods which are now async, thats why added await

## Example

### Before

```ts
WebAppInternals.reloadClientPrograms();
WebAppInternals.pauseClient();
WebAppInternals.generateClientProgram();
WebAppInternals.generateBoilerplate();
WebAppInternals.setInlineScriptsAllowed();
WebAppInternals.enableSubresourceIntegrity();
WebAppInternals.setBundledJsCssUrlRewriteHook();
WebAppInternals.setBundledJsCssPrefix();
WebAppInternals.getBoilerplate;
```

### After

```ts
await WebAppInternals.reloadClientPrograms();
await WebAppInternals.pauseClient();
await WebAppInternals.generateClientProgram();
await WebAppInternals.generateBoilerplate();
await WebAppInternals.setInlineScriptsAllowed();
await WebAppInternals.enableSubresourceIntegrity();
await WebAppInternals.setBundledJsCssUrlRewriteHook();
await WebAppInternals.setBundledJsCssPrefix();
await WebAppInternals.getBoilerplate;
```

