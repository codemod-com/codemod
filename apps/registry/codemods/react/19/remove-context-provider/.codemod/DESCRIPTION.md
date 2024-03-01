# Change Context.Provider to Context

## Description

This codemod will remove the usage of `Provider` for contexts; e.g., Context.Provider to Context

## Example

### Before:

```tsx
function App() {
  const [theme, setTheme] = useState('light');
  // ...
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}
```

### After:

```tsx
function App() {
  const [theme, setTheme] = useState('light');
  // ...
  return (
    <ThemeContext value={theme}>
      <Page />
    </ThemeContext>
  );
}
```