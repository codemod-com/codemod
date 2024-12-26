## What Changed

This codemod relocates the format helpers from the `StyleDictionary` module/class to the `utils` entrypoint, ensuring consistency across the API.

## Before

```jsx
import StyleDictionary from 'style-dictionary';
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;
```

## After

```jsx
import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';
```
