// localStorage / sessionStorage wrappers that never throw (private mode, blocked storage).

function wrap(getStore) {
  return {
    get(key, fallback = null) {
      try {
        const v = getStore().getItem(key);
        return v === null ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        getStore().setItem(key, value);
      } catch (e) {
        /* storage unavailable: ignore */
      }
    },
    getJSON(key, fallback = null) {
      try {
        return JSON.parse(getStore().getItem(key)) ?? fallback;
      } catch (e) {
        return fallback;
      }
    },
    setJSON(key, value) {
      this.set(key, JSON.stringify(value));
    },
  };
}

export const local = wrap(() => window.localStorage);
export const session = wrap(() => window.sessionStorage);
