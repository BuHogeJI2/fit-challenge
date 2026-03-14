import clsx from "clsx";
import { getBadgeClassName } from "./badge.styles";
import type { IBadgeProps } from "./badge.types";

export function Badge({
  children,
  className,
  variant = "neutral",
  ...props
}: IBadgeProps) {
  return (
    <span className={clsx(getBadgeClassName(variant), className)} {...props}>
      {children}
    </span>
  );
}
