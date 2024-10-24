

This codemod updates the following StyleDictionary class methods to be asynchronous: `extend()`, `exportPlatform()`, `getPlatform()`, `buildAllPlatforms()`, `buildPlatform()`, `cleanAllPlatforms()`, and `cleanPlatform()`. This ensures compatibility with the latest asynchronous workflows in Style Dictionary.

## Before

```jsx
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.allTokens);

sd.cleanAllPlatforms();
sd.buildAllPlatforms();
sd.extend();
sd.exportPlatform();
sd.getPlatform();
sd.buildPlatform();
sd.cleanPlatform();
```

## After

```jsx
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.allTokens);

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
await sd.extend();
await sd.exportPlatform();
await sd.getPlatform();
await sd.buildPlatform();
await sd.cleanPlatform();

```
