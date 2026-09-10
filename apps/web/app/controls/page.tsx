'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createControl, getControls } from '@/lib/api/controls';

export default function ControlsPage() {
  const queryClient = useQueryClient();
  const controls = useQuery({ queryKey: ['controls'], queryFn: getControls });
  const [form, setForm] = useState({
    controlCode: '',
    title: '',
    description: '',
    category: '',
    effectiveness: 50,
    status: 'PLANNED',
    owner: ''
  });
  const mutation = useMutation({
    mutationFn: createControl,
    onSuccess: async () => {
      setForm({ controlCode: '', title: '', description: '', category: '', effectiveness: 50, status: 'PLANNED', owner: '' });
      await queryClient.invalidateQueries({ queryKey: ['controls'] });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Controls</h2>
        <p className="mt-1 text-sm text-muted">Track fictional generic controls and their effectiveness.</p>
      </div>
      <form className="grid gap-3 rounded border border-line bg-white p-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
        <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Code" value={form.controlCode} onChange={(event) => setForm({ ...form, controlCode: event.target.value })} />
        <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
        <input required className="rounded border border-line px-3 py-2 text-sm" placeholder="Owner" value={form.owner} onChange={(event) => setForm({ ...form, owner: event.target.value })} />
        <label className="text-sm font-medium md:col-span-2">
          Effectiveness: {form.effectiveness}%
          <input className="mt-2 w-full" type="range" min="0" max="100" value={form.effectiveness} onChange={(event) => setForm({ ...form, effectiveness: Number(event.target.value) })} />
        </label>
        <select className="rounded border border-line px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          {['PLANNED', 'IMPLEMENTED', 'PARTIAL', 'NOT_IMPLEMENTED'].map((value) => <option key={value}>{value}</option>)}
        </select>
        <button className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Create Control'}
        </button>
        {mutation.error ? <p className="md:col-span-4 text-sm text-danger">{mutation.error.message}</p> : null}
      </form>
      <div className="overflow-x-auto rounded border border-line bg-white p-4">
        {controls.isLoading ? <p className="text-sm text-muted">Loading controls...</p> : null}
        {controls.error ? <p className="text-sm text-danger">{controls.error.message}</p> : null}
        {controls.data?.length === 0 ? <p className="text-sm text-muted">No controls found.</p> : null}
        {controls.data?.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-2">Code</th><th>Title</th><th>Category</th><th>Effectiveness</th><th>Status</th><th>Owner</th></tr>
            </thead>
            <tbody>
              {controls.data.map((control) => (
                <tr key={control.id} className="border-t border-line">
                  <td className="py-3">{control.controlCode}</td><td>{control.title}</td><td>{control.category}</td><td>{control.effectiveness}%</td><td>{control.status}</td><td>{control.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
