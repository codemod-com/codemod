This codemod deprecates `systemPreferences.accessibilityDisplayShouldReduceTransparency` property, which is now deprecated in favor of the new `nativeTheme.prefersReducedTransparency`, which provides identical information and works cross-platform.


## Example


### Before

```ts
const reduceTransparency =
  systemPreferences.accessibilityDisplayShouldReduceTransparency;
```

### After

```ts
const reduceTransparency = nativeTheme.prefersReducedTransparency;
```

