## What Changed

This codemod updates several transforms:

- Built-in name transforms now depend solely on the token path and have been renamed from `name/cti/casing` to `name/casing`. Transforms like `name/cti/kebab` are now `name/kebab`, and `name/ti/camel` and `name/ti/constant` have been removed.

- The `content/icon` transform has been renamed to `html/icon` to reflect its focus on HTML entity strings.

- `font/objC/literal`, `font/swift/literal`, and `font/flutter/literal` have been replaced with `content/objC/literal`, `content/swift/literal`, and `content/flutter/literal`, as they perform the same transformations.

## Before

```jsx
{
    "source": ["tokens.json"],
    "platforms": {
      "css": {
        "transforms": [
          "name/cti/camel",
          "name/cti/kebab",
          "name/cti/snake",
          "name/cti/human",
          "name/cti/human",
          "font/objC/literal",
          "font/swift/literal",
          "font/flutter/literal"
        ]
      }
    }
  }
```

## After

```jsx
{
    "source": [
      "tokens.json"
    ],
    "platforms": {
      "css": {
        "transforms": [
          "name/camel",
          "name/kebab",
          "name/snake",
          "name/human",
          "name/human"
        ]
      }
    }
  }
```
