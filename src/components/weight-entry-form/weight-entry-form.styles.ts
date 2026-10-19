import clsx from "clsx";

const form = clsx("flex flex-col gap-5");

const sentence = clsx("text-[1.75rem] leading-normal tracking-tight");

const srOnly = clsx("sr-only");

const weightInput = clsx(
  "w-[4.5ch] border-0 border-b-2 border-ink bg-transparent p-0 text-center text-[2.5rem] font-medium",
  "placeholder:text-rule-strong",
  "focus:outline-none",
);

const error = clsx("text-sm font-medium");

const actions = clsx("flex flex-col gap-2");

export const weightEntryFormClasses = {
  form,
  sentence,
  srOnly,
  weightInput,
  error,
  actions,
};
