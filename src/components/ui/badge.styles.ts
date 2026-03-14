import clsx from "clsx";
import type { TBadgeVariant } from "./badge.types";

const base = clsx(
  "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-semibold",
);

const variantClasses: Record<TBadgeVariant, string> = {
  info: "border-[var(--tone-info-border)] bg-[var(--tone-info-soft)] text-[var(--tone-info-text)]",
  success:
    "border-[var(--tone-success-border)] bg-[var(--tone-success-soft)] text-[var(--tone-success-text)]",
  neutral:
    "border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] text-[var(--tone-neutral-text)]",
  warning:
    "border-[var(--tone-warning-border)] bg-[var(--tone-warning-soft)] text-[var(--tone-warning-text)]",
  display:
    "border-[var(--tone-display-border)] bg-[var(--tone-display-soft)] text-[var(--tone-display-text)]",
};

export const getBadgeClassName = (variant: TBadgeVariant) =>
  clsx(base, variantClasses[variant]);
