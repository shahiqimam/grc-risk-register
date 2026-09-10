import { apiRequest } from './client';
import { Control } from './types';

export function getControls() {
  return apiRequest<Control[]>('/controls');
}
