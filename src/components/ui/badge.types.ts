import type { HTMLAttributes, ReactNode } from "react";

export type TBadgeVariant = "info" | "success" | "neutral" | "warning" | "display";

export interface IBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: TBadgeVariant;
}
