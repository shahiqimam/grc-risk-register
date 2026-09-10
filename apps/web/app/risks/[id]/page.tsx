'use client';

import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '@/components/status-badge';
import { getRisk } from '@/lib/api/risks';

export default function RiskDetailPage({ params }: { params: { id: string } }) {
  const risk = useQuery({ queryKey: ['risk', params.id], queryFn: () => getRisk(params.id) });

  if (risk.isLoading) {
    return <p className="text-sm text-muted">Loading risk...</p>;
  }

  if (risk.error) {
    return <p className="text-sm text-danger">{risk.error.message}</p>;
  }

  if (!risk.data) {
    return <p className="text-sm text-muted">Risk not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">{risk.data.riskCode}</p>
          <h2 className="text-xl font-semibold">{risk.data.title}</h2>
          <p className="mt-1 text-sm text-muted">Owner: {risk.data.owner?.name ?? risk.data.ownerId}</p>
        </div>
        <StatusBadge value={risk.data.status} />
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Likelihood', risk.data.likelihood],
          ['Impact', risk.data.impact],
          ['Inherent Score', risk.data.inherentRiskScore],
          ['Inherent Rating', risk.data.inherentRiskRating],
          ['Residual Score', risk.data.residualRiskScore],
          ['Residual Rating', risk.data.residualRiskRating]
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-line bg-white p-4">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-lg font-semibold">{value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded border border-line bg-white p-4">
          <h3 className="font-semibold">Linked Assets</h3>
          {risk.data.assetLinks?.length ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {risk.data.assetLinks.map(({ asset }) => (
                <li key={asset.id}>{asset.name}, {asset.assetType}, {asset.criticality}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No linked assets.</p>
          )}
        </div>
        <div className="rounded border border-line bg-white p-4">
          <h3 className="font-semibold">Linked Controls</h3>
          {risk.data.controlLinks?.length ? (
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {risk.data.controlLinks.map(({ control }) => (
                <li key={control.id}>{control.controlCode} {control.title}, {control.effectiveness}%, {control.status}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">No linked controls.</p>
          )}
        </div>
      </section>
      <section className="rounded border border-line bg-white p-4">
        <h3 className="font-semibold">History</h3>
        {risk.data.history?.length ? (
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {risk.data.history.map((event) => (
              <li key={event.id}>{event.eventType}: {event.summary}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No history events.</p>
        )}
      </section>
    </div>
  );
}
