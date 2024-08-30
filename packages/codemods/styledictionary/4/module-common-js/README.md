## What Changed

This codemod updates Style Dictionary to use ES Modules format entirely in version 4, making it browser-compatible out of the box. This modern JavaScript standard, which supports NodeJS/Browser interoperability among other benefits, allows Style Dictionary to run in many more environments compared to before.

## Before

```jsx
const StyleDictionary = require('style-dictionary');
```

## After

```jsx
import StyleDictionary from 'style-dictionary';
```
