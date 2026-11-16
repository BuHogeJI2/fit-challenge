import { useLayoutEffect, useRef, useState } from "react";
import type { TSavedEntry } from "./motion.types";

/** Measures the selected direct child for a container's decorative tab indicator. */
export const useSelectionIndicator = <T extends HTMLElement>(activeKey: string, ready = true) => {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !ready) return;
    const update = () => {
      const active = element.querySelector<HTMLElement>(':scope > [aria-current="page"], :scope > [aria-pressed="true"]');
      const bounds = element.getBoundingClientRect();
      const selected = active?.getBoundingClientRect();
      element.style.setProperty("--selection-x", `${selected ? selected.left - bounds.left : 0}px`);
      element.style.setProperty("--selection-width", `${selected?.width ?? 0}px`);
    };
    update();
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    observer?.observe(element);
    [...element.children].forEach((child) => observer?.observe(child));
    window.addEventListener("resize", update);
    return () => { observer?.disconnect(); window.removeEventListener("resize", update); };
  }, [activeKey, ready]);
  return ref;
};

/** Marks a successful entry write; alternating phases restart its CSS emphasis. */
export const useSavedEntry = (): [TSavedEntry | null, (id: string) => void] => {
  const [entry, setEntry] = useState<TSavedEntry | null>(null);
  return [entry, (id) => setEntry((previous) => ({ id, phase: previous?.phase === "a" ? "b" : "a" }))];
};
