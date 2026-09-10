import { apiRequest } from './client';
import { Control } from './types';

export function getControls() {
  return apiRequest<Control[]>('/controls');
}

export function createControl(payload: {
  controlCode: string;
  title: string;
  description?: string;
  category: string;
  effectiveness: number;
  status: string;
  owner: string;
}) {
  return apiRequest<Control>('/controls', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function updateControl(
  id: string,
  payload: {
    controlCode?: string;
    title?: string;
    description?: string;
    category?: string;
    effectiveness?: number;
    status?: string;
    owner?: string;
  }
) {
  return apiRequest<Control>(`/controls/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export function deleteControl(id: string) {
  return apiRequest<{ deleted: boolean }>(`/controls/${id}`, { method: 'DELETE' });
}
