import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import type { TNavigationOptions, TViewPosition } from "./navigation.types";

const listeners = new Set<() => void>();
const positions = new Map<string, TViewPosition>();
const sections = new Map<string, string>();
let observedPath: string | null = null;
const notify = () => {
  if (observedPath) {
    const { path } = parseAppHash(observedPath);
    if (path === "/weight" || path === "/exercises") sections.set(path, observedPath);
  }
  observedPath = getAppPath();
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => {
  if (listeners.size === 0) {
    observedPath = getAppPath();
    window.addEventListener("hashchange", notify);
    window.addEventListener("popstate", notify);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("hashchange", notify);
      window.removeEventListener("popstate", notify);
    }
  };
};

/** Splits an app hash into the route path and its query without a leading ?. */
export const parseAppHash = (hash: string) => {
  const value = hash.replace(/^#/, "") || "/";
  const separator = value.indexOf("?");
  return separator === -1
    ? { path: value, search: "" }
    : { path: value.slice(0, separator) || "/", search: value.slice(separator + 1) };
};

/** Returns the current route and query inside the hash. */
export const getAppPath = () => window.location.hash.slice(1) || "/";

/** Remembers an overview's scroll position and the link that opened its detail. */
export const rememberView = (path = getAppPath()) => {
  positions.set(path, {
    y: window.scrollY,
    href: document.activeElement instanceof HTMLAnchorElement ? document.activeElement.getAttribute("href") : null,
  });
};

/** Navigates within the hash and synchronously notifies the router. */
export const navigateApp = (to: string, { replace = false, state = null }: TNavigationOptions = {}) => {
  const current = getAppPath();
  const { path } = parseAppHash(current);
  if (path === "/weight" || path === "/exercises") sections.set(path, current);
  if (!replace) rememberView();
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = to.startsWith("/") ? to : `/${to}`;
  window.history[replace ? "replaceState" : "pushState"](state, "", url);
  window.dispatchEvent(new Event("hashchange"));
};

/** Provides the hash route to wouter, with query parameters kept in the hash. */
export function useAppLocation(): [string, typeof navigateApp] {
  return [useSyncExternalStore(subscribe, () => parseAppHash(window.location.hash).path, () => "/"), navigateApp];
}

/** Returns the query belonging to the current app hash route. */
export function useAppSearch() {
  return useSyncExternalStore(subscribe, () => parseAppHash(window.location.hash).search, () => "");
}

useAppLocation.searchHook = useAppSearch;
useAppLocation.hrefs = (href: string) => `#${href}`;

/** Builds a route with a query, omitting null and empty values. */
export const appHref = (path: string, values: Record<string, string | null | undefined>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value) search.set(key, value);
  return search.size ? `${path}?${search}` : path;
};

/** Returns a validated in-app detail return path, or the supplied fallback. */
export const getReturnPath = (search: string, fallback: string) => {
  const from = new URLSearchParams(search).get("from");
  return from && from.length <= 4096 && /^\/(?:weight|exercises|trainings\/[^/?#]+)(?:\?[^#]*)?$/.test(from)
    ? from
    : fallback;
};

/** Returns a main section's most recently visited overview route. */
export const getSectionPath = (section: string) => {
  const current = getAppPath();
  return parseAppHash(current).path === section ? current : sections.get(section) ?? section;
};

/** Restores an overview after its live data is ready; new screens start at the top. */
export const useRestoreView = (path: string, ready: boolean, screenKey = parseAppHash(path).path) => {
  const restored = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (!ready || restored.current === screenKey) return;
    restored.current = screenKey;
    const position = positions.get(path);
    const y = position?.y ?? 0;
    if (position?.href) {
      const link = [...document.querySelectorAll<HTMLAnchorElement>("a[href]")]
        .find((item) => item.getAttribute("href") === position.href);
      link?.focus({ preventScroll: true });
    }
    if (window.scrollY !== y) window.scrollTo({ top: y, behavior: "instant" });
  }, [path, ready, screenKey]);
};

/** Clears temporary navigation memory when the journal is replaced. */
export const clearNavigationMemory = () => {
  positions.clear();
  sections.clear();
  observedPath = getAppPath();
};
