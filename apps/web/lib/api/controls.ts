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
