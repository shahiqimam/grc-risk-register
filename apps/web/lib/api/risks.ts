import { apiRequest } from './client';
import { PaginatedRisks, Risk } from './types';

export interface RiskPayload {
  title: string;
  description: string;
  category: string;
  likelihood: number;
  impact: number;
  ownerId: string;
  status: string;
  reviewDate: string;
  linkedAssets?: string[];
  linkedControls?: string[];
}

export function getRisks(params = '') {
  return apiRequest<PaginatedRisks>(`/risks${params}`);
}

export function getRisk(id: string) {
  return apiRequest<Risk>(`/risks/${id}`);
}

export function createRisk(payload: RiskPayload) {
  return apiRequest<Risk>('/risks', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateRisk(id: string, payload: Partial<RiskPayload>) {
  return apiRequest<Risk>(`/risks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}
