Modification of the InterpolationOptions type. In version 23.0.0, the ns property within InterpolationOptions is now constrained to be of type Namespace instead of being a string or a readonly string[]. This change requires you to adjust your code accordingly.

## Example

### Before

```ts
function translateWithNs(key, ns) {
  return i18n.t(key, { ns });
}
```

### After

```ts
function translateWithNs(key, ns: Namespace) {
  return i18n.t(key, { ns });
}
```

