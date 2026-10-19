import clsx from "clsx";

const screen = clsx("flex flex-col pt-6");

const title = clsx("m-0 text-[2.75rem] leading-tight font-normal tracking-tight");

const section = clsx("mt-8 flex flex-col items-start gap-3 border-t border-ink pt-5");

const heading = clsx("m-0 text-lg font-medium");

const text = clsx("m-0 text-[0.9375rem] text-ink-soft");

const meta = clsx("m-0 text-sm text-muted");

const warning = clsx("m-0 text-[0.9375rem] font-medium");

const goalForm = clsx("flex w-full flex-col items-start gap-3");

const buttons = clsx("flex w-full flex-col gap-2");

const fileLabel = clsx(
  "inline-flex min-h-13 cursor-pointer items-center justify-center rounded-full border border-ink px-6 text-base font-medium",
  "hover:bg-ground-sunken",
  "has-[+input:focus-visible]:outline-2 has-[+input:focus-visible]:outline-offset-2 has-[+input:focus-visible]:outline-ink",
);

const fileInput = clsx("sr-only");

const panel = clsx("flex w-full flex-col gap-3 rounded-2xl bg-ground-sunken p-4");

const panelTitle = clsx("m-0 text-base font-medium break-words");

const errors = clsx("m-0 flex list-disc flex-col gap-1 pl-5 text-sm text-ink-soft");

export const settingsScreenClasses = {
  screen,
  title,
  section,
  heading,
  text,
  meta,
  warning,
  goalForm,
  buttons,
  fileLabel,
  fileInput,
  panel,
  panelTitle,
  errors,
};
