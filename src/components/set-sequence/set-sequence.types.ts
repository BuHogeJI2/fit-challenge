import type { HTMLAttributes } from "react";
import type { TLocalSetEntry } from "../../lib/challenge";

export interface ISetSequenceProps extends HTMLAttributes<HTMLDivElement> {
  sets: TLocalSetEntry[];
  title?: string;
  emptyLabel?: string;
  onRemoveSet?: (setId: string) => void;
}
