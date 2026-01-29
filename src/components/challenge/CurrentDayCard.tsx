type CurrentDayCardProps = {
  label: string;
  dateLabel: string;
  title: string;
  description: string;
  exercises: string[];
  emptyMessage: string;
};

export function CurrentDayCard({
  label,
  dateLabel,
  title,
  description,
  exercises,
  emptyMessage,
}: CurrentDayCardProps) {
  return (
    <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 shadow-soft">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-emerald-200">
        <span>{label}</span>
        <span>{dateLabel}</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-white">{title}</h2>
      <p className="mt-1 text-sm text-emerald-100/80">{description}</p>
      <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-slate-950/40 p-5">
        {exercises.length ? (
          <ul className="space-y-3 text-sm text-slate-100">
            {exercises.map((exercise, index) => (
              <li key={`${exercise}-${index}`} className="flex gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300" />
                <span>{exercise}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-slate-300">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
