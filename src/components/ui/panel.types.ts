import type { HTMLAttributes, ReactNode } from "react";

export type TPanelVariant = "surface" | "stat" | "form" | "list";

export interface IPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: TPanelVariant;
}
