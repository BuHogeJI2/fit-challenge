import type { ButtonHTMLAttributes, ReactNode } from "react";

export type TButtonVariant =
  | "primary"
  | "secondary"
  | "info"
  | "destructive"
  | "ghost";

export type TButtonSize = "sm" | "md" | "lg";

export interface IButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: TButtonVariant;
  size?: TButtonSize;
}
