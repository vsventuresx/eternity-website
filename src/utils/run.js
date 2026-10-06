// Starts each module in isolation: one module throwing never stops the others.
// Modules decide for themselves whether their elements are on the page and return early if not.

export function runModules(modules) {
  modules.forEach(([name, init]) => {
    try {
      init();
    } catch (err) {
      console.error(`[eternity] ${name} failed to start`, err);
    }
  });
}
