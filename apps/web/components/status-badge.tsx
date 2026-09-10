const tones: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  VERY_HIGH: 'bg-red-50 text-red-700 border-red-200',
  CRITICAL: 'bg-rose-100 text-rose-800 border-rose-200',
  OPEN: 'bg-blue-50 text-blue-700 border-blue-200',
  UNDER_TREATMENT: 'bg-violet-50 text-violet-700 border-violet-200',
  ACCEPTED: 'bg-slate-100 text-slate-700 border-slate-200',
  CLOSED: 'bg-zinc-100 text-zinc-700 border-zinc-200'
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${tones[value] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      {value.replaceAll('_', ' ')}
    </span>
  );
}
