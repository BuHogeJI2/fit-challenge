import clsx from "clsx";
import type { TPanelVariant } from "./panel.types";

const variantClasses: Record<TPanelVariant, string> = {
  surface: clsx(
    "rounded-[1.45rem] border border-[var(--border-strong)] bg-[linear-gradient(180deg,rgba(19,33,49,0.96),rgba(8,14,22,0.98))]",
    "shadow-[0_16px_40px_rgba(0,0,0,0.24)]",
  ),
  stat: clsx(
    "rounded-[1rem] border border-[var(--tone-neutral-border)] bg-[rgba(255,255,255,0.035)]",
  ),
  form: clsx(
    "rounded-[1.1rem] border border-[var(--tone-info-border)] bg-[rgba(109,199,255,0.09)]",
    "shadow-[0_14px_34px_rgba(109,199,255,0.08)]",
  ),
  list: clsx(
    "rounded-[0.95rem] border border-[var(--tone-neutral-border)] bg-[rgba(4,9,16,0.52)]",
  ),
  success: clsx(
    "rounded-[1.45rem] border border-[var(--tone-success-border)] bg-[linear-gradient(180deg,rgba(24,42,28,0.92),rgba(10,18,16,0.98))]",
    "shadow-[0_14px_32px_rgba(155,247,95,0.10)] ring-1 ring-[rgba(155,247,95,0.14)]",
  ),
};

export const getPanelClassName = (variant: TPanelVariant) => variantClasses[variant];
