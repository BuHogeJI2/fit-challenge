import clsx from "clsx";

export const inputClassName = clsx(
  "min-h-12 w-full rounded-[1rem] border border-[var(--border-strong)] bg-[rgba(7,16,24,0.92)] px-4 text-base text-[var(--text-primary)]",
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-[var(--text-muted)]",
  "focus:border-[var(--tone-info-fill)] focus:outline-none focus:ring-2 focus:ring-[rgba(109,199,255,0.22)]",
);
