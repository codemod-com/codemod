# Replace string ref

## Description

This codemod migrates string refs (deprecated) to callback refs.

## Examples
### Before:

```ts
< div ref = 'refName' / > ;
```

### After:

```ts
< div ref = { ref => this.refs.refName = ref }
/>
```
