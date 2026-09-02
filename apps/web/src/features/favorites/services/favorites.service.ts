import { apiFetch } from '@/lib/api/client';
import { IndicatorSummary } from '@/features/dashboard/services/dashboard.service';

export function getFavorites(): Promise<IndicatorSummary[]> {
  return apiFetch<IndicatorSummary[]>('/favorites');
}

export function addFavorite(code: string): Promise<void> {
  return apiFetch<void>(`/favorites/${code}`, { method: 'POST' });
}

export function removeFavorite(code: string): Promise<void> {
  return apiFetch<void>(`/favorites/${code}`, { method: 'DELETE' });
}
