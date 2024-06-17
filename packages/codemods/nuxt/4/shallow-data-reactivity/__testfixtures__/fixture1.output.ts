// biome-ignore lint/correctness/useHookAtTopLevel: <explanation>
let { data } = useLazyAsyncData('/api/test', { deep: true });
