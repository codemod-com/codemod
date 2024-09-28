This codemod helps in transforming `PointerLockControls.getObject()` to `controls.object`


## Example

### Before

```ts
pointerLockControls.getObject().translateX(translationVelocity.x * delta);
```

### After

```ts
controls.object.translateX(translationVelocity.x * delta);
```


### Before

```ts
pointerLockControls.getObject().translateY(translationVelocity.y * delta);
```

### After

```ts
controls.object.translateY(translationVelocity.y * delta);
```


### Before

```ts
pointerLockControls.getObject().translateZ(translationVelocity.z * delta);
```

### After

```ts
controls.object.translateZ(translationVelocity.z * delta);
```

