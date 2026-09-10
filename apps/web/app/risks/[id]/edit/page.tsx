'use client';

import { useQuery } from '@tanstack/react-query';
import { RiskForm } from '@/components/risk-form';
import { getRisk } from '@/lib/api/risks';

export default function EditRiskPage({ params }: { params: { id: string } }) {
  const risk = useQuery({ queryKey: ['risk', params.id], queryFn: () => getRisk(params.id) });

  if (risk.isLoading) {
    return <p className="text-sm text-muted">Loading risk...</p>;
  }

  if (risk.error) {
    return <p className="text-sm text-danger">{risk.error.message}</p>;
  }

  return <RiskForm title="Edit Risk" risk={risk.data} />;
}
