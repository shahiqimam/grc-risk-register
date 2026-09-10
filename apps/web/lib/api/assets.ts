import { apiRequest } from './client';
import { Asset } from './types';

export function getAssets() {
  return apiRequest<Asset[]>('/assets');
}
