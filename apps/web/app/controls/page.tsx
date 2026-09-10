'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { createControl, deleteControl, getControls, updateControl } from '@/lib/api/controls';
import { Control } from '@/lib/api/types';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<typeof form>(form);
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: typeof form }) => updateControl(id, payload),
    onSuccess: async () => {
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ['controls'] });
      await queryClient.invalidateQueries({ queryKey: ['risks'] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: deleteControl,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['controls'] })
  });

  function beginEdit(control: Control) {
    setEditingId(control.id);
    setEditForm({
      controlCode: control.controlCode,
      title: control.title,
      description: control.description ?? '',
      category: control.category,
      effectiveness: control.effectiveness,
      status: control.status,
      owner: control.owner
    });
  }

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
        {mutation.error ? <p className="text-sm text-danger md:col-span-4">{mutation.error.message}</p> : null}
      </form>
      <div className="overflow-x-auto rounded border border-line bg-white p-4">
        {controls.isLoading ? <p className="text-sm text-muted">Loading controls...</p> : null}
        {controls.error ? <p className="text-sm text-danger">{controls.error.message}</p> : null}
        {controls.data?.length === 0 ? <p className="text-sm text-muted">No controls found.</p> : null}
        {controls.data?.length ? (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr><th className="py-2">Code</th><th>Title</th><th>Category</th><th>Effectiveness</th><th>Status</th><th>Owner</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {controls.data.map((control) => (
                <tr key={control.id} className="border-t border-line">
                  {editingId === control.id ? (
                    <>
                      <td className="py-3"><input className="w-24 rounded border border-line px-2 py-1" value={editForm.controlCode} onChange={(event) => setEditForm({ ...editForm, controlCode: event.target.value })} /></td>
                      <td><input className="w-full rounded border border-line px-2 py-1" value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} /></td>
                      <td><input className="w-full rounded border border-line px-2 py-1" value={editForm.category} onChange={(event) => setEditForm({ ...editForm, category: event.target.value })} /></td>
                      <td><input className="w-20 rounded border border-line px-2 py-1" type="number" min="0" max="100" value={editForm.effectiveness} onChange={(event) => setEditForm({ ...editForm, effectiveness: Number(event.target.value) })} /></td>
                      <td><select className="rounded border border-line px-2 py-1" value={editForm.status} onChange={(event) => setEditForm({ ...editForm, status: event.target.value })}>{['PLANNED', 'IMPLEMENTED', 'PARTIAL', 'NOT_IMPLEMENTED'].map((value) => <option key={value}>{value}</option>)}</select></td>
                      <td><input className="w-full rounded border border-line px-2 py-1" value={editForm.owner} onChange={(event) => setEditForm({ ...editForm, owner: event.target.value })} /></td>
                      <td className="space-x-2">
                        <button className="rounded bg-accent px-3 py-1 text-xs font-semibold text-white" onClick={() => updateMutation.mutate({ id: control.id, payload: editForm })}>Save</button>
                        <button className="rounded border border-line px-3 py-1 text-xs" onClick={() => setEditingId(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-3">{control.controlCode}</td><td>{control.title}</td><td>{control.category}</td><td>{control.effectiveness}%</td><td>{control.status}</td><td>{control.owner}</td>
                      <td className="space-x-2">
                        <button className="rounded border border-line px-3 py-1 text-xs" onClick={() => beginEdit(control)}>Edit</button>
                        <button className="rounded border border-red-200 px-3 py-1 text-xs text-danger" onClick={() => deleteMutation.mutate(control.id)}>Delete</button>
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
