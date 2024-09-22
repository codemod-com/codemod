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