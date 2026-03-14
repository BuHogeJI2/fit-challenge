import clsx from "clsx";

const wrapper = clsx(
  "mt-12 rounded-[2rem] border border-[var(--border-subtle)] bg-[rgba(13,23,34,0.9)] px-5 py-6",
  "shadow-[0_30px_70px_rgba(3,8,20,0.35)] backdrop-blur-sm",
);

const toneBase = clsx(
  "inline-flex rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]",
);

const loading = clsx(toneBase, "border border-[var(--tone-info-border)] bg-[var(--tone-info-soft)] text-[var(--tone-info-text)]");
const error = clsx(toneBase, "border border-[var(--tone-danger-border)] bg-[var(--tone-danger-soft)] text-[var(--tone-danger-text)]");
const empty = clsx(toneBase, "border border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] text-[var(--tone-neutral-text)]");

const title = clsx("mt-4 text-2xl font-semibold text-[var(--text-primary)]");

const body = clsx("mt-3 max-w-2xl text-sm leading-6 text-[var(--text-muted)]");

export const challengeStatusClasses = {
  wrapper,
  loading,
  error,
  empty,
  title,
  body,
};
