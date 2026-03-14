import type { HTMLAttributes, ReactNode } from "react";

export type TPanelVariant = "surface" | "stat" | "form" | "list" | "success";

export interface IPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: TPanelVariant;
}
