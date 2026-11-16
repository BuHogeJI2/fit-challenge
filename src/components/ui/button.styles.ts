import clsx from "clsx";
import type { TButtonSize, TButtonVariant } from "./button.types";

const base = clsx(
  "motion-press inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-colors",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
  "disabled:cursor-not-allowed disabled:opacity-40",
);

const sizeClasses: Record<TButtonSize, string> = {
  md: "min-h-13 px-6 text-base",
  sm: "min-h-11 px-4 text-sm",
};

const variantClasses: Record<TButtonVariant, string> = {
  filled: "bg-ink text-ground hover:bg-black",
  outline: "border border-ink bg-transparent text-ink hover:bg-ground-sunken",
  soft: "bg-ground-sunken text-ink hover:bg-rule",
  quiet: "min-h-11 bg-transparent px-0 text-muted hover:text-ink",
};

export const getButtonClassName = (variant: TButtonVariant, size: TButtonSize) =>
  clsx(base, variant === "quiet" ? null : sizeClasses[size], variantClasses[variant]);
