export const memoize = (
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fn: (...args: any[]) => Promise<any>,
  maxCacheSize = 100,
) => {
  const cache = new Map();

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return async (...args: any[]): Promise<any> => {
    if (!cache.has(fn)) {
      const functionCache = new Map();

      // queue to maintain the order of insertion
      const orderQueue: string[] = [];

      cache.set(fn, { functionCache, orderQueue });
    }

    const { functionCache, orderQueue } = cache.get(fn);

    const argsHash = JSON.stringify(args);

    if (functionCache.has(argsHash)) {
      return functionCache.get(argsHash);
    }

    const res = await fn(...args);

    if (functionCache.size >= maxCacheSize) {
      const oldestKey = orderQueue.shift();
      functionCache.delete(oldestKey);
    }

    functionCache.set(argsHash, res);
    orderQueue.push(argsHash);

    return res;
  };
};
