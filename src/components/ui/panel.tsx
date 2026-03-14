import clsx from "clsx";
import { getPanelClassName } from "./panel.styles";
import type { IPanelProps } from "./panel.types";

export function Panel({
  children,
  className,
  variant = "surface",
  ...props
}: IPanelProps) {
  return (
    <div className={clsx(getPanelClassName(variant), className)} {...props}>
      {children}
    </div>
  );
}
