const minimatch = require('minimatch');

const filePath = 'src/app.js';
const pattern = '**/*.js';

if (minimatch(filePath, pattern)) {
  console.log('File matches the pattern');
}