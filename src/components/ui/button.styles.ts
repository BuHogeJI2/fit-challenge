import clsx from "clsx";
import type { TButtonSize, TButtonVariant } from "./button.types";

const base = clsx(
  "inline-flex items-center justify-center gap-2 rounded-[1rem] border font-semibold transition",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-app)]",
  "disabled:cursor-not-allowed disabled:opacity-60",
);

const sizeClasses: Record<TButtonSize, string> = {
  sm: "min-h-9 px-3.5 text-xs",
  md: "min-h-11 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
};

const variantClasses: Record<TButtonVariant, string> = {
  primary: clsx(
    "cursor-pointer border-[var(--tone-success-border)] bg-[linear-gradient(180deg,var(--tone-success-strong),var(--tone-success-fill))]",
    "text-[var(--text-inverse)] shadow-[0_18px_36px_rgba(155,247,95,0.2)] hover:brightness-[1.03] active:scale-[0.985]",
    "focus-visible:ring-[var(--tone-success-fill)]",
  ),
  secondary: clsx(
    "cursor-pointer border-[var(--tone-neutral-border)] bg-[var(--tone-neutral-soft)] text-[var(--text-primary)]",
    "hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.985] focus-visible:ring-[var(--tone-info-fill)]",
  ),
  info: clsx(
    "cursor-pointer border-[var(--tone-info-border)] bg-[rgba(109,199,255,0.2)] text-[var(--tone-info-text)]",
    "shadow-[0_12px_24px_rgba(109,199,255,0.12)] hover:border-[var(--tone-info-fill)] hover:bg-[rgba(109,199,255,0.26)] active:scale-[0.985]",
    "focus-visible:ring-[var(--tone-info-fill)]",
  ),
  destructive: clsx(
    "cursor-pointer border-[var(--tone-danger-border)] bg-[var(--tone-danger-soft)] text-[var(--tone-danger-text)]",
    "hover:border-[rgba(255,125,114,0.42)] hover:bg-[rgba(255,125,114,0.18)] hover:text-[var(--text-primary)] active:scale-[0.985]",
    "focus-visible:ring-[var(--tone-danger-fill)]",
  ),
  ghost: clsx(
    "cursor-pointer border-transparent bg-transparent text-[var(--text-secondary)]",
    "hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--text-primary)] active:scale-[0.985] focus-visible:ring-[var(--tone-info-fill)]",
  ),
};

export const getButtonClassName = (
  variant: TButtonVariant,
  size: TButtonSize,
) => clsx(base, sizeClasses[size], variantClasses[variant]);
