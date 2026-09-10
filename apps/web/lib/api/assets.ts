import { apiRequest } from './client';
import { Asset } from './types';

export function getAssets() {
  return apiRequest<Asset[]>('/assets');
}

export function createAsset(payload: {
  name: string;
  description?: string;
  assetType: string;
  criticality: string;
  owner: string;
  status: string;
}) {
  return apiRequest<Asset>('/assets', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}
