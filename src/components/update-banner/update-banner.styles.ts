import clsx from "clsx";

const banner = clsx(
  "mx-6 mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-2xl bg-ground-sunken px-4 py-2",
);

const text = clsx("m-0 py-2 text-sm");

const actions = clsx("flex items-center gap-4");

export const updateBannerClasses = {
  banner,
  text,
  actions,
};
