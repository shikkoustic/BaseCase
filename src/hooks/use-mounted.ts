import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Avoids the hydration-mismatch flash for client-only UI (like a theme toggle)
// without the `useEffect(() => setState(true))` pattern, which triggers a
// cascading extra render React now flags as impure-effect usage.
export function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
