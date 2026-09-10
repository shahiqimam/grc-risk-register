import { apiRequest } from './client';

export interface Summary {
  totalRisks: number;
  criticalResidualRisks: number;
  highResidualRisks: number;
  openRisks: number;
  overdueReviews: number;
  averageResidualScore: number;
}

export interface HeatmapCell {
  impact: number;
  likelihood: number;
  count: number;
}

export function getSummary() {
  return apiRequest<Summary>('/dashboard/summary');
}

export function getHeatmap() {
  return apiRequest<{ model: string; cells: HeatmapCell[][] }>('/dashboard/heatmap');
}
