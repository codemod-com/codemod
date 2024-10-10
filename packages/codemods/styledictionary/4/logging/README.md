

This codemod updates the logging system to be more configurable, as detailed in the Logging docs. You can now customize the verbosity of logs and silence warnings and success logs, in addition to the previous option of setting `log: 'error'` to change the default behavior to throw warnings as errors.

## Before

```jsx
{
    "source": ["tokens.json"],
    "log": "error"
}
```

## After

```jsx
{
    "source": [
      "tokens.json"
    ],
    "log": {
      "warnings": "error",
      "verbosity": "default"
  }
}
```
