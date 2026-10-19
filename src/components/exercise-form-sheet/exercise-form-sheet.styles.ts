import clsx from "clsx";

const form = clsx("flex flex-col gap-5");

const fieldset = clsx("m-0 flex flex-col gap-1 border-0 p-0 disabled:opacity-60");

const legend = clsx("mb-1 p-0 text-sm text-muted");

const option = clsx(
  "flex min-h-13 cursor-pointer items-center gap-3 border-b border-rule py-2",
  "has-[:disabled]:cursor-not-allowed",
);

const radio = clsx("size-5 accent-ink");

const optionText = clsx("flex flex-col text-base");

const optionHint = clsx("text-sm text-muted");

const hint = clsx("m-0 pt-1 text-sm text-muted");

const error = clsx("m-0 text-sm font-medium");

const actions = clsx("flex flex-col gap-2");

export const exerciseFormSheetClasses = {
  form,
  fieldset,
  legend,
  option,
  radio,
  optionText,
  optionHint,
  hint,
  error,
  actions,
};
