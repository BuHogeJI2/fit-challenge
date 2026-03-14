import clsx from "clsx";

const container = clsx("min-h-screen");

const content = clsx(
  "mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-6",
  "sm:px-6 sm:pt-8 lg:px-8 lg:pt-10",
);

const footer = clsx(
  "mt-auto flex flex-col items-center justify-center gap-2 border-t border-[var(--border-subtle)] pt-6",
  "text-sm text-[var(--text-muted)]",
);

const footerMeta = clsx("text-center");

const footerAuthor = clsx("font-semibold text-[var(--text-secondary)]");

const footerLink = clsx(
  "inline-flex cursor-pointer items-center text-[var(--tone-info-text)] underline decoration-[var(--tone-info-border)] underline-offset-4",
  "transition hover:text-[var(--text-primary)] hover:decoration-[var(--tone-info-fill)]",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tone-info-fill)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
);

export const challengeAppClasses = {
  container,
  content,
  footer,
  footerMeta,
  footerAuthor,
  footerLink,
};
