Combobox has been refactored and improve to support better custom filtering

## Example

### Before

```ts
< template >
  <
  ComboboxRoot v - model: search - term = "search": display - value = "(v) => v.name" / >
  <
  /template>
```

### After

```ts
< template >
  <
  ComboboxRoot >
  <
  ComboboxInput v - model = "search": display - value = "(v) => v.name" / >
  <
  /ComboboxRoot> <
  /template>
```

