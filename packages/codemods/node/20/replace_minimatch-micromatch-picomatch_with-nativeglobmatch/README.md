This codemod automates the migration of glob-matching functions like `minimatch`, `micromatch`, and `picomatch` to Node.js's native `matchesGlob` support in LTS version 20.17.0.

### Detailed Description
With Node.js 20.17.0 introducing experimental native support for glob matching, there's no longer a need to rely on third-party libraries like `minimatch` and `micromatch`. **npx codemod node/globmatch-native** simplifies the process of updating your codebase to leverage this new feature, ensuring more efficient and streamlined path matching without the overhead of additional dependencies. The tool automatically refactors your code, replacing instances of these libraries with the new native method, helping you keep your codebase up-to-date with the latest Node.js features.

## Example

### Before

```ts
import minimatch from 'minimatch';

const filePath = 'src/app.js';
const pattern = '**/*.js';

if (minimatch(filePath, pattern)) {
  console.log('File matches the pattern');
}
```

### After

```ts
import path from 'path';

const filePath = 'src/app.js';
const pattern = '**/*.js';

if (path.matchesGlob(filePath, pattern)) {
  console.log('File matches the pattern');
}
```

### Before

```ts
import micromatch from 'micromatch';

const files = ['src/app.js', 'src/index.js', 'src/styles.css'];
const pattern = '**/*.js';

const matchedFiles = micromatch(files, pattern);
console.log(matchedFiles);
```

### After

```ts
import path from 'path';

const files = ['src/app.js', 'src/index.js', 'src/styles.css'];
const pattern = '**/*.js';

const matchedFiles = files.filter((file) => path.matchesGlob(file, pattern));
console.log(matchedFiles);
```

--- 
