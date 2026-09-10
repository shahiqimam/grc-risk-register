'use client';

import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { createTreatment, getRisk } from '@/lib/api/risks';

export default function RiskDetailPage({ params }: { params: { id: string } }) {
  const risk = useQuery({ queryKey: ['risk', params.id], queryFn: () => getRisk(params.id) });
  const queryClient = useQueryClient();
  const [treatmentForm, setTreatmentForm] = useState({
    strategy: 'MITIGATE',
    description: '',
    owner: '',
    targetDate: '',
    status: 'PLANNED',
    notes: ''
  });
  const treatmentMutation = useMutation({
    mutationFn: () => createTreatment(params.id, treatmentForm),
    onSuccess: async () => {
      setTreatmentForm({ strategy: 'MITIGATE', description: '', owner: '', targetDate: '', status: 'PLANNED', notes: '' });
      await queryClient.invalidateQueries({ queryKey: ['risk', params.id] });
    }
  });

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
        <h3 className="font-semibold">Treatments</h3>
        {risk.data.treatments?.length ? (
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {risk.data.treatments.map((treatment) => (
              <li key={treatment.id}>{treatment.strategy}: {treatment.status}, owner {treatment.owner}, target {treatment.targetDate}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">No treatments recorded.</p>
        )}
        <form className="mt-4 grid gap-3 md:grid-cols-5" onSubmit={(event) => { event.preventDefault(); treatmentMutation.mutate(); }}>
          <select className="rounded border border-line px-3 py-2 text-sm" value={treatmentForm.strategy} onChange={(event) => setTreatmentForm({ ...treatmentForm, strategy: event.target.value })}>
            {['MITIGATE', 'AVOID', 'TRANSFER', 'ACCEPT'].map((value) => <option key={value}>{value}</option>)}
          </select>
          <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Owner" value={treatmentForm.owner} onChange={(event) => setTreatmentForm({ ...treatmentForm, owner: event.target.value })} />
          <input required className="rounded border border-line px-3 py-2 text-sm" type="date" value={treatmentForm.targetDate} onChange={(event) => setTreatmentForm({ ...treatmentForm, targetDate: event.target.value })} />
          <select className="rounded border border-line px-3 py-2 text-sm" value={treatmentForm.status} onChange={(event) => setTreatmentForm({ ...treatmentForm, status: event.target.value })}>
            {['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((value) => <option key={value}>{value}</option>)}
          </select>
          <button className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={treatmentMutation.isPending}>
            {treatmentMutation.isPending ? 'Saving...' : 'Add Treatment'}
          </button>
          <input required className="rounded border border-line px-3 py-2 text-sm md:col-span-5" placeholder="Description" value={treatmentForm.description} onChange={(event) => setTreatmentForm({ ...treatmentForm, description: event.target.value })} />
          {treatmentMutation.error ? <p className="text-sm text-danger md:col-span-5">{treatmentMutation.error.message}</p> : null}
        </form>
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
