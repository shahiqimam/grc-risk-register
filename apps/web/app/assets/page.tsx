'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssets } from '@/lib/api/assets';

export default function AssetsPage() {
  const assets = useQuery({ queryKey: ['assets'], queryFn: getAssets });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Assets</h2>
        <p className="mt-1 text-sm text-muted">Manage applications, databases, infrastructure, data, and business processes.</p>
      </div>
      <div className="rounded border border-line bg-white p-4">
        {assets.isLoading ? <p className="text-sm text-muted">Loading assets...</p> : null}
        {assets.error ? <p className="text-sm text-danger">{assets.error.message}</p> : null}
        {assets.data?.length === 0 ? <p className="text-sm text-muted">No assets found.</p> : null}
        {assets.data?.length ? (
          <table className="w-full text-left text-sm">
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
