This codemod renames uniforms() function, to uniformsArray()


## Example

### Before

```ts
this.emit('update', this.uniforms());
```

### After

```ts
this.emit('update', this.uniformsArray());
```

