import clsx from "clsx";

const form = clsx("flex flex-col gap-5");

const sentence = clsx("text-[1.75rem] leading-normal tracking-tight");

const srOnly = clsx("sr-only");

const inputBase = clsx(
  "border-0 border-b-2 border-ink bg-transparent p-0 text-center text-[2.5rem] font-medium",
  "placeholder:text-rule-strong focus:outline-none",
);

const input = clsx(inputBase, "w-[2.6ch]");

const pillBase = clsx(
  "min-h-11 cursor-pointer rounded-full text-[0.9375rem]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
);

const picks = clsx("grid grid-cols-5 gap-2");

const pick = clsx(pillBase, "border border-rule-strong hover:border-ink");

const pickActive = clsx(pillBase, "bg-ink text-ground");

const exercisePicker = clsx("-mx-6 flex gap-2 overflow-x-auto px-6 pb-1");

const chip = clsx(pillBase, "shrink-0 border border-rule-strong px-4 hover:border-ink");

const chipActive = clsx(pillBase, "shrink-0 border border-ink bg-ink px-4 text-ground");

const hint = clsx("m-0 text-sm text-ink-soft");

const error = clsx("m-0 text-sm font-medium");

const actions = clsx("flex flex-col gap-2");

export const setEntrySheetClasses = {
  form,
  sentence,
  srOnly,
  input,
  picks,
  pick,
  pickActive,
  exercisePicker,
  chip,
  chipActive,
  hint,
  error,
  actions,
};
