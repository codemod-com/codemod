export let debounce = <T, R>(callback: (...args: T[]) => R, ms: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: T[]) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => callback(...args), ms);
  };
};
