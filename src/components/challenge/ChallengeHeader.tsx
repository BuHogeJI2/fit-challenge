type ChallengeHeaderProps = {
  completedCount: number;
};

export function ChallengeHeader({ completedCount }: ChallengeHeaderProps) {
  return (
    <header className="flex flex-col gap-6">
      <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
        30-Day Fitness Challenge
      </div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-100 sm:text-4xl">
            Train daily, track your streak.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
            Stay consistent with a focused plan for each day. Past days show
            completion status, future days are locked until it is time.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-5 py-4 text-sm text-slate-200 shadow-soft">
          <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Completed
          </div>
          <div className="mt-2 text-2xl font-semibold text-emerald-200">
            {completedCount}
          </div>
          <div className="text-xs text-slate-400">days so far</div>
        </div>
      </div>
    </header>
  );
}
