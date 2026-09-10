'use client';

import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/status-badge';
import { getHeatmap, getSummary } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const summary = useQuery({ queryKey: ['dashboard-summary'], queryFn: getSummary });
  const heatmap = useQuery({ queryKey: ['dashboard-heatmap'], queryFn: getHeatmap });

  if (summary.isLoading || heatmap.isLoading) {
    return <p className="text-sm text-muted">Loading dashboard...</p>;
  }

  if (summary.error || heatmap.error) {
    return <p className="text-sm text-danger">{summary.error?.message ?? heatmap.error?.message}</p>;
  }

  const metrics = summary.data
    ? [
        ['Total Risks', summary.data.totalRisks],
        ['Critical Residual Risks', summary.data.criticalResidualRisks],
        ['High Residual Risks', summary.data.highResidualRisks],
        ['Open Risks', summary.data.openRisks],
        ['Overdue Reviews', summary.data.overdueReviews],
        ['Average Residual Score', summary.data.averageResidualScore]
      ]
    : [];

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="mt-1 text-sm text-muted">Summary metrics and inherent risk heatmap for the demo register.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded border border-line bg-white p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded border border-line bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">5x5 Inherent Risk Heatmap</h3>
            <StatusBadge value="HIGH" />
          </div>
          <div className="grid grid-cols-5 gap-2">
            {heatmap.data?.cells.flat().map((cell) => {
              const score = cell.likelihood * cell.impact;
              const tone =
                score >= 20 ? 'bg-rose-100' : score >= 15 ? 'bg-red-100' : score >= 10 ? 'bg-orange-100' : score >= 5 ? 'bg-amber-100' : 'bg-emerald-100';
              return (
                <button key={`${cell.likelihood}-${cell.impact}`} className={`aspect-square rounded border border-white p-2 text-left ${tone}`}>
                  <span className="block text-xs text-slate-600">L{cell.likelihood} I{cell.impact}</span>
                  <span className="text-lg font-semibold">{cell.count}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="rounded border border-line bg-white p-4">
          <h3 className="font-semibold">Design note</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            The heatmap plots inherent likelihood and impact. Residual score is shown separately because this simplified model does not create residual likelihood or impact dimensions.
          </p>
        </div>
      </section>
    </div>
  );
}
