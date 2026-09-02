import { apiFetch } from '@/lib/api/client';

export interface IndicatorSummary {
  code: string;
  name: string;
  source: string;
  frequency: string;
  unit: string;
  lastValue: number | null;
  referenceDate: string | null;
  variationPercent: number | null;
}

export function getDashboard(): Promise<IndicatorSummary[]> {
  return apiFetch<IndicatorSummary[]>('/indicators');
}
