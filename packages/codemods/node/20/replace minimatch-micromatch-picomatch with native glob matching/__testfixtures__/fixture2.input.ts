import micromatch from 'micromatch';

const files = ['src/app.js', 'src/index.js', 'src/styles.css'];
const pattern = '**/*.js';

const matchedFiles = micromatch(files, pattern);
console.log(matchedFiles);