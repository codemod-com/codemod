This codemod renames dragcontrols.deactivate() to disconnect()

## Example

### Before

```ts
taScene.dragControls.deactivate();
```

### After

```ts
taScene.disconnect();
```

### Before

```ts
dragControls.deactivate();
```

### After

```ts
disconnect();
```

