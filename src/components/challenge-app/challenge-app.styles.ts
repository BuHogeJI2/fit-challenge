import clsx from "clsx";

const container = clsx("min-h-screen");

const content = clsx(
  "mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-6",
  "sm:px-6 sm:pt-8 lg:px-8 lg:pt-10",
);

const footer = clsx(
  "mt-auto flex flex-col items-center justify-center gap-2 border-t border-white/10 pt-6",
  "text-sm text-[var(--ink-dim)]",
);

const footerMeta = clsx("text-center");

const footerAuthor = clsx("font-semibold text-[var(--ink-soft)]");

const footerLink = clsx(
  "inline-flex cursor-pointer items-center text-[var(--brand-lime)] underline decoration-[var(--brand-lime)]/40 underline-offset-4",
  "transition hover:text-[var(--ink-strong)] hover:decoration-[var(--brand-lime)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-lime)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-900)]",
);

export const challengeAppClasses = {
  container,
  content,
  footer,
  footerMeta,
  footerAuthor,
  footerLink,
};
