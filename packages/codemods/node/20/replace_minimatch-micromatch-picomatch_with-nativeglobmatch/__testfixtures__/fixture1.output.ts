const path = require("path");

const filePath = 'src/app.js';
const pattern = '**/*.js';

if (path.matchesGlob(filePath, pattern)) {
  console.log('File matches the pattern');
}