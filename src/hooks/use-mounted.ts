"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Hook that returns true after the component has mounted on the client.
 * Useful for avoiding hydration mismatches with client-only features.
 * Uses useSyncExternalStore to avoid the setState-in-effect pattern.
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
