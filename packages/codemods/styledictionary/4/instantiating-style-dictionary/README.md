## What Changed

This codemod updates Style Dictionary to be a class in version 4, rather than a regular JS object. This allows for instance creation using the new class instantiator keyword. Due to ES Modules' asynchronous nature, you must await initialization before accessing properties like tokens on the instance. The `.extend()` method remains available for creating instances based on another instance.

## Before

```jsx
const StyleDictionary = require('style-dictionary');

const sd = StyleDictionary.extend('config.json');

console.log(sd.tokens);

```

## After

```jsx
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary('config.json');

await sd.hasInitialized;

console.log(sd.tokens);

```
