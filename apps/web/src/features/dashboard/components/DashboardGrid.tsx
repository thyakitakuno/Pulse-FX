'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import { Spinner } from '@/components/common/Spinner';
import {
  getDashboard,
  IndicatorSummary,
} from '@/features/dashboard/services/dashboard.service';
import { getFavorites } from '@/features/favorites/services/favorites.service';
import { IndicatorCard } from './IndicatorCard';

export function DashboardGrid() {
  const [indicators, setIndicators] = useState<IndicatorSummary[] | null>(
    null,
  );
  const [favoriteCodes, setFavoriteCodes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getDashboard(), getFavorites()])
      .then(([dashboardData, favoritesData]) => {
        if (isMounted) {
          setIndicators(dashboardData);
          setFavoriteCodes(
            new Set(favoritesData.map((favorite) => favorite.code)),
          );
        }
      })
      .catch((err) => {
        if (!isMounted) {
          return;
        }

        if (err instanceof ApiError) {
          setError('Não foi possível carregar os indicadores.');
        } else {
          setError('Erro inesperado ao carregar os indicadores.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function handleToggleFavorite(code: string, isFavorite: boolean) {
    setFavoriteCodes((prev) => {
      const next = new Set(prev);
      if (isFavorite) {
        next.add(code);
      } else {
        next.delete(code);
      }
      return next;
    });
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (!indicators) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Spinner />
        Carregando indicadores...
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2">
      {indicators.map((indicator) => (
        <IndicatorCard
          key={indicator.code}
          indicator={indicator}
          isFavorite={favoriteCodes.has(indicator.code)}
          onToggleFavorite={handleToggleFavorite}
        />
      ))}
    </div>
  );
}
