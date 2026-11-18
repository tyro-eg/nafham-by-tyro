/** An in-memory Web Storage for tests that run without a browser */
export const memoryStorage = (
  initial: Record<string, string> = {},
): Storage => {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, String(value));
    },
  };
};

/** A storage that refuses every call, as in a locked-down private window */
export const blockedStorage = (): Storage =>
  new Proxy({} as Storage, {
    get: () => () => {
      throw new Error('storage blocked');
    },
  });
