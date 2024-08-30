


## Example
This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.allTokens);

sd.cleanAllPlatforms();
sd.buildAllPlatforms();
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.allTokens);

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
```
,This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.tokens);

sd.exportPlatform('web');
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.tokens);

await sd.exportPlatform('web');
```
,This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.properties);

sd.buildPlatform('ios');
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.properties);

await sd.buildPlatform('ios');
```
,This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.allProperties);

sd.cleanPlatform('android');
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.allProperties);

await sd.cleanPlatform('android');
```
,This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.allTokens);

sd.registerTransformGroup('custom', []);
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.allTokens);

sd.registerTransformGroup('custom', []);
```
,This codemod turns X into Y. It also does Z.
Note: this is a contrived example. Please modify it.

### Before

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
console.log(sd.allProperties);

sd.registerFormat('customFormat', {});
```

### After

```ts
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({ source: ['tokens.json'], platforms: {} });
await sd.hasInitialized;
console.log(sd.allProperties);

sd.registerFormat('customFormat', {});
```

