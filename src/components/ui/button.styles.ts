import clsx from "clsx";
import type { TButtonSize, TButtonVariant } from "./button.types";

const base = clsx(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-medium transition-colors",
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
  text: "min-h-11 bg-transparent px-0 text-ink underline underline-offset-4 hover:text-black",
  quiet: "min-h-11 bg-transparent px-0 text-muted hover:text-ink",
};

export const getButtonClassName = (variant: TButtonVariant, size: TButtonSize) =>
  clsx(base, variant === "text" || variant === "quiet" ? null : sizeClasses[size], variantClasses[variant]);
