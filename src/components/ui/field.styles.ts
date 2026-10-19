import clsx from "clsx";

const wrapper = clsx("flex flex-col gap-1.5");

const label = clsx("text-sm text-muted");

const input = clsx(
  "min-h-11 w-full border-0 border-b border-rule-strong bg-transparent px-0 text-base",
  "placeholder:text-muted/70",
  "focus:border-ink focus:outline-none",
  "aria-invalid:border-ink",
);

const hint = clsx("text-sm text-muted");

const error = clsx("text-sm font-medium text-ink");

export const fieldClasses = {
  wrapper,
  label,
  input,
  hint,
  error,
};
