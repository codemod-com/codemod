This codemod migrates string refs (deprecated) to callback refs.

## Before

```ts
< div ref = 'refName' / > ;
```

## After

```ts
< div ref = { ref => this.refs.refName = ref }
/>
```
