import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.allTokens);

sd.cleanAllPlatforms();
sd.buildAllPlatforms();