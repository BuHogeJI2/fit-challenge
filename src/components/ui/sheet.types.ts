import type { ReactNode } from "react";

export interface ISheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}
