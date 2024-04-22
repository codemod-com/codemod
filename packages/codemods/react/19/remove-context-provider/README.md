This codemod will remove the usage of `Provider` for contexts; e.g., Context.Provider to Context

## Before:

```tsx
function App() {
  const [theme, setTheme] = useState('light');
  // ...
  return (
    <UseTheme.Provider value={theme}>
      <Page />
    </UseTheme.Provider>
  );
}
```

## After:

```tsx
function App() {
  const [theme, setTheme] = useState('light');
  // ...
  return (
    <UseTheme value={theme}>
      <Page />
    </UseTheme>
  );
}
```