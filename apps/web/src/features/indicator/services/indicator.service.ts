import { apiFetch } from '@/lib/api/client';

export interface IndicatorObservation {
  date: string;
  value: number;
}

export interface IndicatorDetail {
  code: string;
  name: string;
  source: string;
  frequency: string;
  unit: string;
  description: string;
  limitations: string;
  lastValue: number | null;
  referenceDate: string | null;
  variationPercent: number | null;
  observations: IndicatorObservation[];
}

export function getIndicatorDetail(code: string): Promise<IndicatorDetail> {
  return apiFetch<IndicatorDetail>(`/indicators/${code}`);
}
