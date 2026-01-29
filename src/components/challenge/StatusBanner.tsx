type StatusBannerProps = {
  loading: boolean;
  error: string | null;
  daysCount: number;
};

export function StatusBanner({ loading, error, daysCount }: StatusBannerProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 text-sm text-slate-300">
        Loading challenge data from Supabase...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
        Unable to load days. {error}
      </div>
    );
  }

  if (daysCount === 0) {
    return (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 text-sm text-slate-300">
        No days found in the database yet. Add records to the{" "}
        <span className="font-semibold text-slate-100">Days</span> table to
        populate the challenge.
      </div>
    );
  }

  return null;
}
