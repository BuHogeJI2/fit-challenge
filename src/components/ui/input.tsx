import { forwardRef } from "react";
import clsx from "clsx";
import { inputClassName } from "./input.styles";
import type { TInputProps } from "./input.types";

export const Input = forwardRef<HTMLInputElement, TInputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(inputClassName, className)}
      {...props}
    />
  ),
);

Input.displayName = "Input";
