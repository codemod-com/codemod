import path from "path";

const files = ['src/app.js', 'src/index.js', 'src/styles.css'];
const pattern = '**/*.js';

const matchedFiles = files.filter(file => path.matchesGlob(file, pattern));
console.log(matchedFiles);