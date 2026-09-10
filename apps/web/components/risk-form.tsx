'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getAssets } from '@/lib/api/assets';
import { getControls } from '@/lib/api/controls';
import { createRisk, updateRisk } from '@/lib/api/risks';
import { getUsers } from '@/lib/api/users';
import { Risk } from '@/lib/api/types';
import { StatusBadge } from './status-badge';

const schema = z.object({
  title: z.string().min(3).max(180),
  description: z.string().min(10).max(4000),
  category: z.string().min(1),
  likelihood: z.coerce.number().min(1).max(5),
  impact: z.coerce.number().min(1).max(5),
  ownerId: z.string().uuid(),
  status: z.string().min(1),
  reviewDate: z.string().min(1),
  linkedAssets: z.array(z.string()).default([]),
  linkedControls: z.array(z.string()).default([])
});

type FormValues = z.infer<typeof schema>;

export function RiskForm({ title, risk }: { title: string; risk?: Risk }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['users'], queryFn: getUsers });
  const assets = useQuery({ queryKey: ['assets'], queryFn: getAssets });
  const controls = useQuery({ queryKey: ['controls'], queryFn: getControls });
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: risk?.title ?? '',
      description: risk?.description ?? '',
      category: risk?.category ?? 'CYBERSECURITY',
      likelihood: risk?.likelihood ?? 3,
      impact: risk?.impact ?? 3,
      ownerId: risk?.ownerId ?? '',
      status: risk?.status ?? 'OPEN',
      reviewDate: risk?.reviewDate ?? '',
      linkedAssets: risk?.assetLinks?.map((link) => link.asset.id) ?? [],
      linkedControls: risk?.controlLinks?.map((link) => link.control.id) ?? []
    }
  });
  const values = form.watch();
  const score = values.likelihood * values.impact;
  const rating = useMemo(() => {
    if (score <= 4) return 'LOW';
    if (score <= 9) return 'MEDIUM';
    if (score <= 14) return 'HIGH';
    if (score <= 19) return 'VERY_HIGH';
    return 'CRITICAL';
  }, [score]);

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => (risk ? updateRisk(risk.id, payload) : createRisk(payload)),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: ['risks'] });
      router.push(`/risks/${saved.id}`);
    }
  });

  function toggle(field: 'linkedAssets' | 'linkedControls', id: string) {
    const current = form.getValues(field);
    form.setValue(field, current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  return (
    <form className="max-w-4xl space-y-6" onSubmit={form.handleSubmit((payload) => mutation.mutate(payload))}>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">Backend scoring remains authoritative; this preview updates as values change.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Title
          <input className="mt-1 w-full rounded border border-line px-3 py-2" {...form.register('title')} />
          {form.formState.errors.title ? <span className="text-xs text-danger">{form.formState.errors.title.message}</span> : null}
        </label>
        <label className="block text-sm font-medium">
          Category
          <select className="mt-1 w-full rounded border border-line px-3 py-2" {...form.register('category')}>
            {['CYBERSECURITY', 'OPERATIONAL', 'THIRD_PARTY', 'COMPLIANCE', 'PRIVACY', 'BUSINESS_CONTINUITY', 'FINANCIAL', 'OTHER'].map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Owner
          <select className="mt-1 w-full rounded border border-line px-3 py-2" {...form.register('ownerId')}>
            <option value="">Select owner</option>
            {users.data?.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Review Date
          <input className="mt-1 w-full rounded border border-line px-3 py-2" type="date" {...form.register('reviewDate')} />
        </label>
        <label className="block text-sm font-medium">
          Likelihood
          <input className="mt-1 w-full" type="range" min="1" max="5" {...form.register('likelihood', { valueAsNumber: true })} />
          <span className="text-sm text-muted">{values.likelihood}</span>
        </label>
        <label className="block text-sm font-medium">
          Impact
          <input className="mt-1 w-full" type="range" min="1" max="5" {...form.register('impact', { valueAsNumber: true })} />
          <span className="text-sm text-muted">{values.impact}</span>
        </label>
      </div>
      <label className="block text-sm font-medium">
        Description
        <textarea className="mt-1 min-h-32 w-full rounded border border-line px-3 py-2" {...form.register('description')} />
        {form.formState.errors.description ? <span className="text-xs text-danger">{form.formState.errors.description.message}</span> : null}
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-line bg-white p-4">
          <h3 className="font-semibold">Linked Assets</h3>
          <div className="mt-3 space-y-2">
            {assets.data?.map((asset) => (
              <label key={asset.id} className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={values.linkedAssets?.includes(asset.id)} onChange={() => toggle('linkedAssets', asset.id)} />
                {asset.name}
              </label>
            ))}
          </div>
        </div>
        <div className="rounded border border-line bg-white p-4">
          <h3 className="font-semibold">Linked Controls</h3>
          <div className="mt-3 space-y-2">
            {controls.data?.map((control) => (
              <label key={control.id} className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={values.linkedControls?.includes(control.id)} onChange={() => toggle('linkedControls', control.id)} />
                {control.controlCode} {control.title}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded border border-line bg-white p-4">
        <p className="text-sm text-muted">Live inherent score preview</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-2xl font-semibold">{score}</span>
          <StatusBadge value={rating} />
        </div>
      </div>
      {mutation.error ? <p className="text-sm text-danger">{mutation.error.message}</p> : null}
      <button className="rounded bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save Risk'}
      </button>
    </form>
  );
}
