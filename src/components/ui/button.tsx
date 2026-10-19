import { forwardRef } from "react";
import clsx from "clsx";
import { getButtonClassName } from "./button.styles";
import type { IButtonProps } from "./button.types";

export const Button = forwardRef<HTMLButtonElement, IButtonProps>(
  ({ className, variant = "filled", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={clsx(getButtonClassName(variant, size), className)}
      {...props}
    />
  ),
);

Button.displayName = "Button";
