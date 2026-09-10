'use client';

import { useQuery } from '@tanstack/react-query';
import { getControls } from '@/lib/api/controls';

export default function ControlsPage() {
  const controls = useQuery({ queryKey: ['controls'], queryFn: getControls });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Controls</h2>
        <p className="mt-1 text-sm text-muted">Track fictional generic controls and their effectiveness.</p>
      </div>
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
