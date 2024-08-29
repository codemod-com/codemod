watch(
  () => context.modelValue.value,
  async (n) => {
    await nextTick();
    updateIndicatorStyle();
  }, { immediate: true },
);