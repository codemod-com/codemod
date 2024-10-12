Recalculates tabs indicator position on direction change in the Tab Component

## Example

### Before

```ts
watch(
  () => context.modelValue.value,
  async (n) => {
    await nextTick();
    updateIndicatorStyle();
  }, { immediate: true },
);
```

### After

```ts
watch(
  () => [context.modelValue.value, context?.dir.value],
  async () => {
    await nextTick();
    updateIndicatorStyle();
  }, { immediate: true },
);
```

