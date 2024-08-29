Modification of the InterpolationOptions type. In version 23.0.0, the ns property within InterpolationOptions is now constrained to be of type Namespace instead of being a string or a readonly string[]. This change requires you to adjust your code accordingly.

## Example

### Before

```ts
const options = {
  interpolation: {
    escapeValue: false,
  },
};

i18n.init({
  lng: 'en',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  normalize: (type, value) => {
    switch (type) {
      case 'translation':
        return value.toUpperCase(); // Custom normalization for translations
      default:
        return value;
    }
  },
  options,
});
```

### After

```ts
i18n.init({
  lng: 'en',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  normalize: (type, value) => {
    switch (type) {
      case 'translation':
        return value.toUpperCase(); // Custom normalization for translations
      default:
        return value;
    }
  },
});
```

