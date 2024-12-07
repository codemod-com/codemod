Renaming types or functions can be part of an effort to clarify the library's API, deprecate old functionality, or introduce new features. In this case, KeysWithSeparator has been renamed to JoinKeys. This means wherever KeysWithSeparator was used in the codebase, it needs to be replaced with JoinKeys.

## Example

### Before

```ts
import { KeysWithSeparator } from 'i18next';

const myTranslationFunction = (key: KeysWithSeparator < string > ) => {
  // Function body remains the same
};
```

### After

```ts
import { JoinKeys } from 'i18next';

const myTranslationFunction = (key: JoinKeys < string > ) => {
  // Function body remains the same
};
```

