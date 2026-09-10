'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createAsset, deleteAsset, getAssets, updateAsset } from '@/lib/api/assets';
import { Asset } from '@/lib/api/types';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof form>(form);
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof form }) => updateAsset(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ['assets'] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assets'] })
  });

  function beginEdit(asset: Asset) {
    setEditingId(asset.id);
    setEditForm({
      name: asset.name,
      description: asset.description ?? '',
      assetType: asset.assetType,
      criticality: asset.criticality,
      owner: asset.owner,
      status: asset.status
    });
  }

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
        {mutation.error ? <p className="text-sm text-danger md:col-span-3">{mutation.error.message}</p> : null}
      </form>
      <div className="overflow-x-auto rounded border border-line bg-white p-4">
        {assets.isLoading ? <p className="text-sm text-muted">Loading assets...</p> : null}
        {assets.error ? <p className="text-sm text-danger">{assets.error.message}</p> : null}
        {assets.data?.length === 0 ? <p className="text-sm text-muted">No assets found.</p> : null}
        {assets.data?.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-2">Name</th><th>Type</th><th>Criticality</th><th>Owner</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {assets.data.map((asset) => (
                <tr key={asset.id} className="border-t border-line">
                  {editingId === asset.id ? (
                    <>
                      <td className="py-3"><input className="w-full rounded border border-line px-2 py-1" value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></td>
                      <td><select className="rounded border border-line px-2 py-1" value={editForm.assetType} onChange={(event) => setEditForm({ ...editForm, assetType: event.target.value })}>{['APPLICATION', 'DATABASE', 'SERVER', 'ENDPOINT', 'NETWORK', 'DATA', 'BUSINESS_PROCESS', 'OTHER'].map((value) => <option key={value}>{value}</option>)}</select></td>
                      <td><select className="rounded border border-line px-2 py-1" value={editForm.criticality} onChange={(event) => setEditForm({ ...editForm, criticality: event.target.value })}>{['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((value) => <option key={value}>{value}</option>)}</select></td>
                      <td><input className="w-full rounded border border-line px-2 py-1" value={editForm.owner} onChange={(event) => setEditForm({ ...editForm, owner: event.target.value })} /></td>
                      <td><select className="rounded border border-line px-2 py-1" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>{['ACTIVE', 'INACTIVE', 'RETIRED'].map((value) => <option key={value}>{value}</option>)}</select></td>
                      <td className="space-x-2">
                        <button className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white" onClick={() => updateMutation.mutate({ id: asset.id, payload: editForm })}>Save</button>
                        <button className="rounded border border-line px-3 py-1 text-xs" onClick={() => setEditingId(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3">{asset.name}</td><td>{asset.assetType}</td><td>{asset.criticality}</td><td>{asset.owner}</td><td>{asset.status}</td>
                      <td className="space-x-2">
                        <button className="rounded border border-line px-3 py-1 text-xs" onClick={() => beginEdit(asset)}>Edit</button>
                        <button className="rounded border border-red-200 px-3 py-1 text-xs text-danger" onClick={() => deleteMutation.mutate(asset.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {updateMutation.error ? <p className="mt-3 text-sm text-danger">{updateMutation.error.message}</p> : null}
        {deleteMutation.error ? <p className="mt-3 text-sm text-danger">{deleteMutation.error.message}</p> : null}
      </div>
    </div>
  );
}
