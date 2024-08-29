watch(
  () => [context.modelValue.value, context?.dir.value],
  async () => {
    await nextTick();
    updateIndicatorStyle();
  }, { immediate: true },
);