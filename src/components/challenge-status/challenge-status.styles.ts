import clsx from "clsx";

const wrapper = clsx(
  "mt-12 rounded-[2rem] border border-white/10 bg-[rgba(11,16,30,0.86)] px-5 py-6",
  "shadow-[0_30px_70px_rgba(3,8,20,0.35)] backdrop-blur-sm",
);

const toneBase = clsx(
  "inline-flex rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em]",
);

const loading = clsx(toneBase, "border border-[var(--brand-lime)]/25 bg-[var(--brand-lime)]/10 text-[var(--brand-lime)]");
const error = clsx(toneBase, "border border-[var(--brand-hot)]/25 bg-[var(--brand-hot)]/10 text-[var(--brand-peach)]");
const empty = clsx(toneBase, "border border-white/10 bg-white/6 text-[var(--ink-soft)]");

const title = clsx("mt-4 text-2xl font-semibold text-[var(--ink-strong)]");

const body = clsx("mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]");

export const challengeStatusClasses = {
  wrapper,
  loading,
  error,
  empty,
  title,
  body,
};
