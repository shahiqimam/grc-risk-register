'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createAsset, getAssets } from '@/lib/api/assets';

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const assets = useQuery({ queryKey: ['assets'], queryFn: getAssets });
  const [form, setForm] = useState({
    name: '',
    description: '',
    assetType: 'APPLICATION',
    criticality: 'MEDIUM',
    owner: '',
    status: 'ACTIVE'
  });
  const mutation = useMutation({
    mutationFn: createAsset,
    onSuccess: async () => {
      setForm({ name: '', description: '', assetType: 'APPLICATION', criticality: 'MEDIUM', owner: '', status: 'ACTIVE' });
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Assets</h2>
        <p className="mt-1 text-sm text-muted">Manage applications, databases, infrastructure, data, and business processes.</p>
      </div>
      <form className="grid gap-3 rounded border border-line bg-white p-4 md:grid-cols-3" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
        <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Owner" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
        <select className="rounded border border-line px-3 py-2 text-sm" value={form.assetType} onChange={(event) => setForm({ ...form, assetType: event.target.value })}>
          {['APPLICATION', 'DATABASE', 'SERVER', 'ENDPOINT', 'NETWORK', 'DATA', 'BUSINESS_PROCESS', 'OTHER'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="rounded border border-line px-3 py-2 text-sm" value={form.criticality} onChange={(event) => setForm({ ...form, criticality: event.target.value })}>
          {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <select className="rounded border border-line px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {['ACTIVE', 'INACTIVE', 'RETIRED'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <button className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Create Asset'}
        </button>
        {mutation.error ? <p className="md:col-span-3 text-sm text-danger">{mutation.error.message}</p> : null}
      </form>
      <div className="overflow-x-auto rounded border border-line bg-white p-4">
        {assets.isLoading ? <p className="text-sm text-muted">Loading assets...</p> : null}
        {assets.error ? <p className="text-sm text-danger">{assets.error.message}</p> : null}
        {assets.data?.length === 0 ? <p className="text-sm text-muted">No assets found.</p> : null}
        {assets.data?.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-2">Name</th><th>Type</th><th>Criticality</th><th>Owner</th><th>Status</th></tr>
            </thead>
            <tbody>
              {assets.data.map((asset) => (
                <tr key={asset.id} className="border-t border-line">
                  <td className="py-3">{asset.name}</td><td>{asset.assetType}</td><td>{asset.criticality}</td><td>{asset.owner}</td><td>{asset.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
