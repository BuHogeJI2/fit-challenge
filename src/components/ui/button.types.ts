import type { ButtonHTMLAttributes } from "react";

export type TButtonVariant = "filled" | "outline" | "text" | "quiet";

export type TButtonSize = "md" | "sm";

export interface IButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
}
