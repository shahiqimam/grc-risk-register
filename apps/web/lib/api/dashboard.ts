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

export function getCategoryBreakdown() {
  return apiRequest<Array<{ name: string; value: number }>>('/dashboard/category-breakdown');
}

export function getStatusBreakdown() {
  return apiRequest<Array<{ name: string; value: number }>>('/dashboard/status-breakdown');
}

export function getResidualRatingBreakdown() {
  return apiRequest<Array<{ name: string; value: number }>>('/dashboard/residual-rating-breakdown');
}

export function getInherentVsResidual() {
  return apiRequest<Array<{ riskCode: string; inherent: number; residual: number }>>('/dashboard/inherent-vs-residual');
}
