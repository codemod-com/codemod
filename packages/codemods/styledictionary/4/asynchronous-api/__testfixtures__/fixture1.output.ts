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
