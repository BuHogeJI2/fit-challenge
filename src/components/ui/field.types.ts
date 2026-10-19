import type { InputHTMLAttributes } from "react";

export interface IFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string | null;
}
