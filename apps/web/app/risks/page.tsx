'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { StatusBadge } from '@/components/status-badge';
import { API_URL } from '@/lib/api/client';
import { getRisks } from '@/lib/api/risks';

export default function RisksPage() {
  const [search, setSearch] = useState('');
  const queryString = search ? `?search=${encodeURIComponent(search)}` : '';
  const risks = useQuery({ queryKey: ['risks', search], queryFn: () => getRisks(queryString) });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Risk Register</h2>
          <p className="mt-1 text-sm text-muted">Search, filter, export, and open risk records.</p>
        </div>
        <div className="flex gap-2">
          <a href={`${API_URL}/risks/export.csv${queryString}`} className="rounded border border-line px-4 py-2 text-sm font-semibold">
            Export CSV
          </a>
          <Link href="/risks/new" className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white">
            New Risk
          </Link>
        </div>
      </div>
      <div className="rounded border border-line bg-white">
        <div className="border-b border-line p-4">
          <input className="w-full max-w-md rounded border border-line px-3 py-2 text-sm" placeholder="Search risks" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        {risks.isLoading ? <p className="p-4 text-sm text-muted">Loading risks...</p> : null}
        {risks.error ? <p className="p-4 text-sm text-danger">{risks.error.message}</p> : null}
        {risks.data?.items.length === 0 ? <p className="p-4 text-sm text-muted">No risks found.</p> : null}
        {risks.data?.items.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  {['Risk Code', 'Title', 'Category', 'Owner', 'Inherent Risk', 'Residual Risk', 'Status', 'Review Date'].map((heading) => (
                    <th key={heading} className="px-4 py-3">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risks.data.items.map((risk) => (
                  <tr key={risk.id} className="border-b border-line hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/risks/${risk.id}`}>{risk.riskCode}</Link>
                    </td>
                    <td className="px-4 py-3">{risk.title}</td>
                    <td className="px-4 py-3">{risk.category}</td>
                    <td className="px-4 py-3">{risk.owner?.name ?? risk.ownerId}</td>
                    <td className="px-4 py-3">
                      <StatusBadge value={risk.inherentRiskRating} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={risk.residualRiskRating} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={risk.status} />
                    </td>
                    <td className="px-4 py-3">{risk.reviewDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
